"use client";

import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  createTransaction,
  updateTransaction,
  type ActionResult,
} from "@/lib/transactions/actions";
import { parseDollarsTocents, formatAccountType } from "@/lib/format";
import type { Account, Category, Transaction } from "@prisma/client";

interface TransactionFormModalProps {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
  trigger?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export function TransactionFormModal({
  accounts,
  categories,
  transaction,
  trigger,
  open: controlledOpen,
  onClose: onExternalClose,
}: TransactionFormModalProps) {
  const isEditing = !!transaction;
  const hasAccounts = accounts.length > 0;

  const initialType = transaction?.type ?? "EXPENSE";
  const initialAmount = transaction
    ? (Math.abs(transaction.amountCents) / 100).toFixed(2)
    : "0.00";

  const [isOpen, setIsOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"EXPENSE" | "INCOME">(
    initialType as "EXPENSE" | "INCOME"
  );
  const [amountDisplay, setAmountDisplay] = useState(initialAmount);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const effectiveOpen = controlledOpen ?? isOpen;

  const action = isEditing ? updateTransaction : createTransaction;
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    formRef.current?.reset();
    if (!isEditing) {
      setAmountDisplay("0.00");
      setTransactionType("EXPENSE");
    }
    onExternalClose?.();
  }, [isEditing, onExternalClose]);

  useEffect(() => {
    if (state?.success) {
      handleClose();
    }
  }, [state, handleClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (effectiveOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [effectiveOpen]);

  const filteredCategories = categories.filter(
    (c) => c.type === transactionType
  );
  const parentCategories = filteredCategories.filter((c) => !c.parentId);
  const childCategories = filteredCategories.filter((c) => c.parentId);

  function getCategoryGroup(parentId: string) {
    return childCategories.filter((c) => c.parentId === parentId);
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)}>{trigger}</span>
      ) : null}

      {!trigger && !controlledOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:shadow-md hover:shadow-accent/15 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          Add Transaction
        </button>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="rounded-2xl border border-border p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm w-full max-w-md animate-fade-in-up"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-serif text-xl text-foreground">
                {isEditing ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {isEditing
                  ? "Update the transaction details"
                  : "Record a new income or expense transaction"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-text-tertiary hover:text-foreground transition-colors text-xl leading-none p-1"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {!hasAccounts && !isEditing && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-center">
              <p className="text-sm font-medium text-amber-800">
                No accounts configured yet
              </p>
              <p className="text-sm text-amber-600 mt-1">
                You need at least one account to record transactions.
              </p>
              <Link
                href="/settings?tab=accounts"
                onClick={handleClose}
                className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
              >
                Add Account in Settings
              </Link>
            </div>
          )}

          <form
            ref={formRef}
            action={formAction}
            className={`mt-5 space-y-5 ${!hasAccounts && !isEditing ? "hidden" : ""}`}
          >
            {isEditing && (
              <input type="hidden" name="id" value={transaction.id} />
            )}
            <input type="hidden" name="type" value={transactionType} />
            <input
              type="hidden"
              name="amountCents"
              value={parseDollarsTocents(amountDisplay)}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType("EXPENSE")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  transactionType === "EXPENSE"
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("INCOME")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  transactionType === "INCOME"
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label htmlFor="txn-description" className="block text-sm font-semibold text-foreground mb-1.5">
                Description
              </label>
              <input
                id="txn-description"
                type="text"
                name="description"
                placeholder="What was this for?"
                required
                defaultValue={transaction?.description ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="txn-account" className="block text-sm font-semibold text-foreground mb-1.5">
                Account
              </label>
              <select
                id="txn-account"
                name="accountId"
                required
                defaultValue={transaction?.accountId ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="" disabled>
                  Select account
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatAccountType(a.type)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="txn-amount" className="block text-sm font-semibold text-foreground mb-1.5">
                  Amount
                </label>
                <input
                  id="txn-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountDisplay}
                  onChange={(e) => setAmountDisplay(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="txn-category" className="block text-sm font-semibold text-foreground mb-1.5">
                  Category
                </label>
                <select
                  id="txn-category"
                  name="categoryId"
                  required
                  defaultValue={transaction?.categoryId ?? ""}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {parentCategories.map((parent) => {
                    const children = getCategoryGroup(parent.id);
                    if (children.length > 0) {
                      return (
                        <optgroup key={parent.id} label={parent.name}>
                          <option value={parent.id}>{parent.name}</option>
                          {children.map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="txn-date" className="block text-sm font-semibold text-foreground mb-1.5">
                Date
              </label>
              <input
                id="txn-date"
                type="date"
                name="date"
                required
                defaultValue={
                  transaction
                    ? format(new Date(transaction.date), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd")
                }
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state && !state.success && state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:opacity-60"
              >
                {isPending
                  ? isEditing
                    ? "Saving..."
                    : "Adding..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
