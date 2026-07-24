import { prisma } from "../lib/prisma";
import { sendEmail } from "../utils/sendEmail";

export const runAmcReminderJob = async (): Promise<void> => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringAmcs = await prisma.amc.findMany({
        where: {
            status: "ACTIVE",
            endDate: {
                lte: sevenDaysFromNow,
                gte: new Date(),
            },
        },
        include: {
            installation: {
                include: {
                    contact: true,
                },
            },
        },
    });

    console.log(`AMC reminder job: found ${expiringAmcs.length} expiring AMC(s)`);

    for (const amc of expiringAmcs) {
        const email = amc.installation.contact?.email;

        if (!email) {
            console.log(`AMC ${amc.amcNumber}: contact has no email, skipping`);
            continue;
        }

        try {
            await sendEmail({
                to: email,
                subject: `AMC Renewal Reminder — ${amc.amcNumber}`,
                html: `
                    <p>Dear ${amc.installation.contact?.firstName ?? "Customer"},</p>
                    <p>Your AMC (<b>${amc.amcNumber}</b>) for installation <b>${amc.installation.installationNumber}</b> is expiring on <b>${amc.endDate.toDateString()}</b>.</p>
                    <p>Please contact us to renew before expiry.</p>
                `,
            });
            console.log(`Reminder sent for AMC ${amc.amcNumber} to ${email}`);
        } catch (err) {
            console.error(`Failed to send reminder for AMC ${amc.amcNumber}:`, err);
        }
    }
};