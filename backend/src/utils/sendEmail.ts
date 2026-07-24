import { transporter } from "../config/mailer";
import { env } from "../config/env";

type SendEmailInput = {
    to: string;
    subject: string;
    html: string;
};

export const sendEmail = async ({ to, subject, html }: SendEmailInput): Promise<void> => {
    await transporter.sendMail({
        from: env.GMAIL_USER,
        to,
        subject,
        html,
    });
};