"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAccountSchema, updateAccountSchema } from "@/lib/validation/account";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createAccount(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    institution: (formData.get("institution") as string) || undefined,
    currency: (formData.get("currency") as string) || "USD",
    last4: (formData.get("last4") as string) || undefined,
  };

  const parsed = createAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.account.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        institution: parsed.data.institution || null,
        currency: parsed.data.currency,
        last4: parsed.data.last4 || null,
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    console.error("Failed to create account:", e);
    return { success: false, error: "Failed to create account" };
  }
}

export async function updateAccount(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    institution: (formData.get("institution") as string) || undefined,
    currency: (formData.get("currency") as string) || undefined,
    last4: (formData.get("last4") as string) || undefined,
  };

  const parsed = updateAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.account.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
        ...(parsed.data.institution !== undefined && {
          institution: parsed.data.institution || null,
        }),
        ...(parsed.data.currency !== undefined && { currency: parsed.data.currency }),
        ...(parsed.data.last4 !== undefined && { last4: parsed.data.last4 || null }),
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    console.error("Failed to update account:", e);
    return { success: false, error: "Failed to update account" };
  }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const txCount = await prisma.transaction.count({ where: { accountId: id } });
    if (txCount > 0) {
      return {
        success: false,
        error: `Cannot delete account with ${txCount} transaction${txCount !== 1 ? "s" : ""}. Remove or reassign them first.`,
      };
    }
    await prisma.account.delete({ where: { id } });
    revalidatePath("/transactions");
    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete account:", e);
    return { success: false, error: "Failed to delete account" };
  }
}
