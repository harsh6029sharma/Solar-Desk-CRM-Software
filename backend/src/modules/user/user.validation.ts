import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.cuid2("Invalid role id"),
});