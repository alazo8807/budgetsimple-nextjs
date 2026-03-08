"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createCategorySchema, updateCategorySchema } from "@/lib/validation/category";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createCategory(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
    type: formData.get("type") as string,
    parentId: (formData.get("parentId") as string) || undefined,
  };

  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        color: parsed.data.color,
        type: parsed.data.type,
        parentId: parsed.data.parentId || null,
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/categories");
    return { success: true };
  } catch (e) {
    console.error("Failed to create category:", e);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    color: formData.get("color") as string,
    type: formData.get("type") as string,
    parentId: (formData.get("parentId") as string) || undefined,
  };

  const parsed = updateCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
        ...(parsed.data.parentId !== undefined && {
          parentId: parsed.data.parentId || null,
        }),
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/categories");
    return { success: true };
  } catch (e) {
    console.error("Failed to update category:", e);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const [txCount, childCount] = await Promise.all([
      prisma.transaction.count({ where: { categoryId: id } }),
      prisma.category.count({ where: { parentId: id } }),
    ]);

    if (txCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${txCount} transaction${txCount !== 1 ? "s" : ""}. Remove or reassign them first.`,
      };
    }

    if (childCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${childCount} subcategor${childCount !== 1 ? "ies" : "y"}. Remove them first.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/transactions");
    revalidatePath("/categories");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete category:", e);
    return { success: false, error: "Failed to delete category" };
  }
}
