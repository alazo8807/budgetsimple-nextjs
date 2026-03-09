"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@/lib/validation/transaction";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createTransaction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    description: formData.get("description") as string,
    amountCents: Number(formData.get("amountCents")),
    type: formData.get("type") as string,
    accountId: formData.get("accountId") as string,
    categoryId: formData.get("categoryId") as string,
    date: formData.get("date") as string,
  };

  const parsed = createTransactionSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Validation failed" };
  }

  try {
    await prisma.transaction.create({
      data: {
        description: parsed.data.description,
        amountCents: parsed.data.amountCents,
        type: parsed.data.type,
        accountId: parsed.data.accountId,
        categoryId: parsed.data.categoryId,
        date: new Date(parsed.data.date),
      },
    });

    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    console.error("Failed to create transaction:", e);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function updateTransaction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    description: formData.get("description") as string,
    amountCents: Number(formData.get("amountCents")),
    type: formData.get("type") as string,
    accountId: formData.get("accountId") as string,
    categoryId: formData.get("categoryId") as string,
    date: formData.get("date") as string,
  };

  const parsed = updateTransactionSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Validation failed" };
  }

  try {
    await prisma.transaction.update({
      where: { id: parsed.data.id },
      data: {
        description: parsed.data.description,
        amountCents: parsed.data.amountCents,
        type: parsed.data.type,
        accountId: parsed.data.accountId,
        categoryId: parsed.data.categoryId,
        date: new Date(parsed.data.date),
      },
    });

    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    console.error("Failed to update transaction:", e);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete transaction:", e);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function bulkUpdateTransactions(
  ids: string[],
  updates: {
    description?: string;
    amountCents?: number;
    type?: "EXPENSE" | "INCOME";
    accountId?: string;
    categoryId?: string;
    date?: string;
  }
): Promise<ActionResult> {
  try {
    const data: Record<string, unknown> = {};
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.amountCents !== undefined) data.amountCents = updates.amountCents;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.accountId !== undefined) data.accountId = updates.accountId;
    if (updates.categoryId !== undefined) data.categoryId = updates.categoryId;
    if (updates.date !== undefined) data.date = new Date(updates.date);

    await prisma.transaction.updateMany({
      where: { id: { in: ids } },
      data,
    });

    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    console.error("Failed to bulk update transactions:", e);
    return { success: false, error: "Failed to bulk update transactions" };
  }
}
