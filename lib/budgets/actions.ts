"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDollarsTocents, getCurrentMonth } from "@/lib/format";
import { createBudgetSchema, updateBudgetSchema } from "@/lib/validation/budget";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createBudget(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const month = formData.get("month") as string;
  const currentMonth = getCurrentMonth();

  if (month < currentMonth) {
    return { success: false, error: "Cannot create budgets for past months." };
  }

  const raw = {
    month,
    categoryId: formData.get("categoryId") as string,
    amountCents: parseDollarsTocents(formData.get("amount") as string),
    isRecurring: formData.get("isRecurring") === "true",
  };

  const parsed = createBudgetSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Validation failed" };
  }

  try {
    await prisma.budget.create({ data: parsed.data });
    revalidatePath("/budget");
    return { success: true };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { success: false, error: "A budget for this category already exists this month." };
    }
    return { success: false, error: "Failed to create budget." };
  }
}

export async function updateBudget(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const viewMonth = formData.get("month") as string;
  const currentMonth = getCurrentMonth();

  if (viewMonth < currentMonth) {
    return { success: false, error: "Cannot edit budgets from past months." };
  }

  // Fetch the existing budget to get its month and categoryId
  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Budget not found." };
  }

  const raw = {
    id,
    amountCents: parseDollarsTocents(formData.get("amount") as string),
    isRecurring: formData.get("isRecurring") === "true",
    categoryId: formData.get("categoryId") as string,
  };

  const parsed = updateBudgetSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Validation failed" };
  }

  const { amountCents, isRecurring } = parsed.data;

  try {
    if (viewMonth === existing.month) {
      await prisma.budget.update({
        where: { id },
        data: { amountCents, isRecurring },
      });
    } else {
      // Fork: create/update a record for viewMonth; original record unchanged
      await prisma.budget.upsert({
        where: { month_categoryId: { month: viewMonth, categoryId: existing.categoryId } },
        create: { month: viewMonth, categoryId: existing.categoryId, amountCents, isRecurring },
        update: { amountCents, isRecurring },
      });
    }
    revalidatePath("/budget");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update budget." };
  }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const currentMonth = getCurrentMonth();

  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Budget not found." };
  }
  if (existing.month < currentMonth) {
    return { success: false, error: "Cannot delete budgets from past months." };
  }

  try {
    await prisma.budget.delete({ where: { id } });
    revalidatePath("/budget");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete budget." };
  }
}
