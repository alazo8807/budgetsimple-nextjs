"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { formatCents, formatAccountType, formatUTCDate } from "@/lib/format";
import { deleteTransaction } from "@/lib/transactions/actions";
import type { Account, Category, Transaction } from "@prisma/client";

const TransactionFormModal = dynamic(
  () => import("./transaction-form-modal").then((m) => m.TransactionFormModal),
  { ssr: false }
);
const BulkEditModal = dynamic(
  () => import("./bulk-edit-modal").then((m) => m.BulkEditModal),
  { ssr: false }
);

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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

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

  const allSelected =
    transactions.length > 0 &&
    transactions.every((t) => selectedIds.has(t.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        transactions.forEach((t) => next.delete(t.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        transactions.forEach((t) => next.add(t.id));
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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

      {selectedIds.size >= 2 && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
          <span className="text-text-secondary font-medium">
            {selectedIds.size} rows selected
          </span>
          <button
            onClick={() => setBulkEditOpen(true)}
            className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Edit selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded-md px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-hover/60">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-border"
                    aria-label="Select all"
                  />
                </th>
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
                <th className="px-4 py-3 text-right font-medium text-text-secondary w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {transactions.map((t, i) => (
                <tr key={t.id} className={`hover:bg-surface-hover transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 10)}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => toggleRow(t.id)}
                      className="rounded border-border"
                      aria-label={`Select ${t.description}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-foreground/70 tabular-nums whitespace-nowrap">
                    {formatUTCDate(t.date, "MMM d, yyyy")}
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
                          aria-label="Edit"
                          title="Edit"
                          className="rounded-md p-1.5 text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          aria-label="Delete"
                          title="Delete"
                          className="rounded-md p-1.5 text-text-tertiary hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
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

      {bulkEditOpen && (
        <BulkEditModal
          transactions={transactions.filter((t) => selectedIds.has(t.id))}
          accounts={accounts}
          categories={categories}
          open={bulkEditOpen}
          onClose={() => {
            setBulkEditOpen(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </>
  );
}
