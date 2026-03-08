import { z } from "zod/v4";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(255),
  amountCents: z.int().min(1, "Amount must be greater than zero"),
  type: transactionTypeSchema,
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.iso.date("Invalid date"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1, "Transaction ID is required"),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFilterSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM format")
    .optional(),
  type: transactionTypeSchema.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
