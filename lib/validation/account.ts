import { z } from "zod/v4";

export const accountTypeSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "LINE_OF_CREDIT",
  "CASH",
  "INVESTMENT",
]);

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: accountTypeSchema,
  institution: z.string().max(100).optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  last4: z
    .string()
    .regex(/^\d{4}$/, "Must be 4 digits")
    .optional()
    .or(z.literal("")),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
