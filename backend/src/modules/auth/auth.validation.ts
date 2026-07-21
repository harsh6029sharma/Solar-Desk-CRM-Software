import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Invalid email",
  }),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Password is required"
          : "Invalid password",
    })
    .min(8, "Password must be at least 8 characters"),
});