"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { formatCents, formatAccountType } from "@/lib/format";
import { deleteTransaction } from "@/lib/transactions/actions";
import { TransactionFormModal } from "./transaction-form-modal";
import type { Account, Category, Transaction } from "@prisma/client";

type TransactionWithRelations = Transaction & {
  account: Account;
  category: Category;
};

interface TransactionTableProps {
  transactions: TransactionWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  accounts: Account[];
  categories: Category[];
}

type SortableColumn = "date" | "amount" | "description";

export function TransactionTable({
  transactions,
  total,
  page,
  pageSize,
  totalPages,
  accounts,
  categories,
}: TransactionTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "date_desc";

  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  function toggleSort(column: SortableColumn) {
    const colKey = column === "amount" ? "amount" : column;
    const isCurrentAsc = currentSort === `${colKey}_asc`;
    const newSort = isCurrentAsc ? `${colKey}_desc` : `${colKey}_asc`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  function sortIndicator(column: SortableColumn) {
    const colKey = column === "amount" ? "amount" : column;
    if (currentSort === `${colKey}_asc`) return " \u25B2";
    if (currentSort === `${colKey}_desc`) return " \u25BC";
    return "";
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteTransaction(id);
      if (!result.success) {
        setDeleteError(result.error ?? "Delete failed");
      }
      setDeletingId(null);
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center animate-fade-in">
        <p className="text-text-secondary text-lg">No transactions found</p>
        <p className="text-text-tertiary text-sm mt-1">
          Add a transaction or change your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {deleteError ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 flex items-center justify-between text-sm text-red-600 mb-2">
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-4 text-red-400 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-hover/60">
                <th
                  className="px-4 py-3 text-left font-medium text-text-secondary cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("date")}
                >
                  Date{sortIndicator("date")}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-text-secondary cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("description")}
                >
                  Description{sortIndicator("description")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">
                  Account
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">
                  Category
                </th>
                <th
                  className="px-4 py-3 text-right font-medium text-text-secondary cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("amount")}
                >
                  Amount{sortIndicator("amount")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {transactions.map((t, i) => (
                <tr key={t.id} className={`hover:bg-surface-hover transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 10)}`}>
                  <td className="px-4 py-3 text-foreground/70 tabular-nums whitespace-nowrap">
                    {format(new Date(t.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-foreground">{t.description}</td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    <span>{t.account.name}</span>
                    <span className="ml-1 text-xs text-text-tertiary">
                      {formatAccountType(t.account.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: t.category.color }}
                      />
                      <span className="text-foreground/70">{t.category.name}</span>
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap ${
                      t.type === "INCOME" ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatCents(t.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {deletingId === t.id ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={isPendingDelete}
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {isPendingDelete ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingTransaction(t)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-text-tertiary hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-light px-4 py-3 text-sm text-text-secondary">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-md border border-border px-3 py-1 transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-md border border-border px-3 py-1 transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editingTransaction && (
        <TransactionFormModal
          accounts={accounts}
          categories={categories}
          transaction={editingTransaction}
          open={true}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
}
