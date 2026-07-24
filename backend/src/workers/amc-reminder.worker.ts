import { Worker } from "bullmq";

import { bullConnection } from "../config/queue";
import { runAmcReminderJob } from "../jobs/amc-reminder.job";

export const amcReminderWorker = new Worker(
    "amc-reminder",
    async () => {
        await runAmcReminderJob();
    },
    { connection: bullConnection }
);

amcReminderWorker.on("completed", () => {
    console.log("AMC reminder job completed");
});

amcReminderWorker.on("failed", (job, err) => {
    console.error(`AMC reminder job failed:`, err);
});