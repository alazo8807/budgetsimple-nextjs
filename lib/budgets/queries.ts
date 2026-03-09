import { cache } from "react";
import { prisma } from "@/lib/db";
import { parse, startOfMonth, endOfMonth } from "date-fns";

export type BudgetWithCategory = Awaited<ReturnType<typeof getBudgetsForMonth>>[number];

export const getBudgetsForMonth = cache(async function getBudgetsForMonth(month: string) {
  // Fetch budgets that apply to this month:
  // 1. Budgets created exactly for this month (recurring or not)
  // 2. Recurring budgets whose start month is <= viewMonth
  const all = await prisma.budget.findMany({
    where: {
      OR: [
        { month },
        { isRecurring: true, month: { lte: month } },
      ],
    },
    include: {
      category: {
        include: { parent: true },
      },
    },
    orderBy: { month: "desc" },
  });

  // Deduplicate: for same categoryId, keep the first (most recent startMonth)
  const seen = new Set<string>();
  return all.filter((b) => {
    if (seen.has(b.categoryId)) return false;
    seen.add(b.categoryId);
    return true;
  });
});

export const getSpendingForMonth = cache(async function getSpendingForMonth(month: string) {
  const monthDate = parse(month, "yyyy-MM", new Date());
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      date: { gte: start, lte: end },
    },
    _sum: { amountCents: true },
  });

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (row.categoryId && row._sum.amountCents) {
      result[row.categoryId] = row._sum.amountCents;
    }
  }
  return result;
});
