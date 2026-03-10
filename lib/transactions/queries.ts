import { cache } from "react";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth, parse } from "date-fns";
import type { TransactionFilter } from "@/lib/validation/transaction";

const SORT_MAP: Record<string, Prisma.TransactionOrderByWithRelationInput> = {
  date_asc: { date: "asc" },
  date_desc: { date: "desc" },
  amount_asc: { amountCents: "asc" },
  amount_desc: { amountCents: "desc" },
  description_asc: { description: "asc" },
  description_desc: { description: "desc" },
};

function buildWhere(filters: TransactionFilter): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {};

  if (filters.month) {
    const monthDate = parse(filters.month, "yyyy-MM", new Date());
    where.date = {
      gte: startOfMonth(monthDate),
      lte: endOfMonth(monthDate),
    };
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.accountIds) {
    const ids = filters.accountIds.split(",").filter(Boolean);
    if (ids.length > 0) where.accountId = { in: ids };
  }

  if (filters.categoryIds) {
    const ids = filters.categoryIds.split(",").filter(Boolean);
    if (ids.length > 0) where.categoryId = { in: ids };
  }

  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  return where;
}

export const getTransactions = cache(async function getTransactions(filters: TransactionFilter) {
  const where = buildWhere(filters);
  const orderBy = SORT_MAP[filters.sort ?? "date_desc"] ?? SORT_MAP.date_desc;
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        account: true,
        category: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
});

export const getTransactionSummary = cache(async function getTransactionSummary(
  filters: TransactionFilter
) {
  const where = buildWhere({ ...filters, type: undefined });

  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amountCents: true } }),
    prisma.transaction.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amountCents: true } }),
  ]);

  const incomeCents = income._sum.amountCents ?? 0;
  const expensesCents = expenses._sum.amountCents ?? 0;
  return { incomeCents, expensesCents, balanceCents: incomeCents - expensesCents };
});

export const getCategories = cache(async function getCategories(type?: "INCOME" | "EXPENSE") {
  return prisma.category.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: "asc" },
    include: { children: true },
  });
});
