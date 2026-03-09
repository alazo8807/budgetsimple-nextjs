"use client";

import { useState, useTransition } from "react";
import { bulkUpdateTransactions } from "@/lib/transactions/actions";
import type { Account, Category, Transaction } from "@prisma/client";

type TransactionWithRelations = Transaction & {
  account: Account;
  category: Category;
};

interface BulkEditModalProps {
  transactions: TransactionWithRelations[];
  accounts: Account[];
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

export function BulkEditModal({
  transactions,
  accounts,
  categories,
  open,
  onClose,
}: BulkEditModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | null>(null);
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const filteredCategories =
    type === null
      ? categories
      : categories.filter((c) => c.type === type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const ids = transactions.map((t) => t.id);
    const updates: Parameters<typeof bulkUpdateTransactions>[1] = {};

    if (type !== null) updates.type = type;
    if (description.trim()) updates.description = description.trim();
    if (accountId) updates.accountId = accountId;
    if (categoryId) updates.categoryId = categoryId;
    if (amount) updates.amountCents = Math.round(parseFloat(amount) * 100);
    if (date) updates.date = date;

    startTransition(async () => {
      const result = await bulkUpdateTransactions(ids, updates);
      if (!result.success) {
        setError(result.error ?? "Update failed");
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface border border-border shadow-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Edit {transactions.length} Transactions
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          Only the fields you fill in will be updated. Leave a field blank to keep each transaction&apos;s existing value.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Type
            </label>
            <div className="flex gap-1">
              {(["EXPENSE", "INCOME", null] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => {
                    setType(v);
                    setCategoryId("");
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === v
                      ? "bg-accent text-white"
                      : "bg-surface-hover text-text-secondary hover:text-foreground"
                  }`}
                >
                  {v === null ? "Keep existing" : v === "EXPENSE" ? "Expense" : "Income"}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Leave blank to keep existing"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">— Keep existing —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">— Keep existing —</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Leave blank to keep existing"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
