"use client";

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
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TransactionsToolbar accounts={accounts} categories={categories} />
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
    </>
  );
}
