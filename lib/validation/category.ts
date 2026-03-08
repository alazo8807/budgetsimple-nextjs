import { z } from "zod/v4";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  type: z.enum(["INCOME", "EXPENSE"]),
  parentId: z.string().optional().or(z.literal("")),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
