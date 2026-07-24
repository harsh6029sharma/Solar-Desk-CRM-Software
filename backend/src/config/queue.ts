import { Queue } from "bullmq";
import Redis from "ioredis";

import { env } from "./env";

export const bullConnection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const amcReminderQueue = new Queue("amc-reminder", {
    connection: bullConnection,
});

export const scheduleAmcReminderJob = async (): Promise<void> => {
    await amcReminderQueue.add(
        "daily-amc-check",
        {},
        {
            repeat: { pattern: "0 9 * * *" }, // roz subah 9 baje
            removeOnComplete: true,
            removeOnFail: true,
        }
    );
};