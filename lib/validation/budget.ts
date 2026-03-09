import { z } from "zod";

const monthRegex = /^\d{4}-\d{2}$/;

export const createBudgetSchema = z.object({
  month: z.string().regex(monthRegex, "Invalid month format"),
  categoryId: z.string().min(1, "Category is required"),
  amountCents: z.number().int().min(1, "Amount must be at least $0.01"),
  isRecurring: z.boolean(),
});

export const updateBudgetSchema = z.object({
  id: z.string().min(1),
  amountCents: z.number().int().min(1, "Amount must be at least $0.01").optional(),
  isRecurring: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
