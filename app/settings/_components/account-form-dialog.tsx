"use client";

import { useActionState, useEffect, useRef, useCallback } from "react";
import { createAccount, updateAccount, type ActionResult } from "@/lib/accounts/actions";
import type { Account } from "@prisma/client";

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "LINE_OF_CREDIT", label: "Line of Credit" },
  { value: "CASH", label: "Cash" },
  { value: "INVESTMENT", label: "Investment" },
] as const;

interface AccountFormDialogProps {
  account?: Account;
  onClose: () => void;
}

export function AccountFormDialog({ account, onClose }: AccountFormDialogProps) {
  const isEditing = !!account;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateAccount : createAccount;
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="rounded-2xl border border-border p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm w-full max-w-md animate-fade-in-up m-auto"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              {isEditing ? "Edit Account" : "Add Account"}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {isEditing
                ? "Update your account details"
                : "Add a new financial account"}
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

        <form ref={formRef} action={formAction} className="mt-5 space-y-5">
          {isEditing && <input type="hidden" name="id" value={account.id} />}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={account?.name ?? ""}
              placeholder="e.g. TD Bank Checking"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Account Type
            </label>
            <select
              name="type"
              required
              defaultValue={account?.type ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="" disabled>
                Select type
              </option>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Institution
              </label>
              <input
                type="text"
                name="institution"
                defaultValue={account?.institution ?? ""}
                placeholder="e.g. TD Bank"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Last 4 Digits
              </label>
              <input
                type="text"
                name="last4"
                defaultValue={account?.last4 ?? ""}
                placeholder="1234"
                maxLength={4}
                pattern="\d{4}"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
              />
            </div>
          </div>

          <input type="hidden" name="currency" value={account?.currency ?? "USD"} />

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
                  : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
