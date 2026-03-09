"use client";

import { Suspense } from "react";
import { FilterPanel } from "./filter-panel";
import { MonthPicker } from "@/app/_components/month-picker";
import { TransactionsToolbar } from "./transactions-toolbar";
import { TransactionFormModal } from "./transaction-form-modal";
import { TransactionTable } from "./transaction-table";
import type { Account, Category, Transaction } from "@prisma/client";

type TransactionWithRelations = Transaction & {
  account: Account;
  category: Category;
};

interface TransactionsClientProps {
  accounts: Account[];
  categories: Category[];
  transactions: TransactionWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function TransactionsClient({
  accounts,
  categories,
  transactions,
  total,
  page,
  pageSize,
  totalPages,
}: TransactionsClientProps) {
  return (
    // flex-col on mobile (filter stacks above table), flex-row on desktop (sidebar + main)
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
      {/* FilterPanel: renders mobile toggle on small screens, sidebar on md+ */}
      <FilterPanel accounts={accounts} categories={categories} />

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        <Suspense fallback={null}>
          <MonthPicker />
        </Suspense>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TransactionsToolbar />
          <TransactionFormModal accounts={accounts} categories={categories} />
        </div>

        <TransactionTable
          transactions={transactions}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          accounts={accounts}
          categories={categories}
        />
      </div>
    </div>
  );
}
