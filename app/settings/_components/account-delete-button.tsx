"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/accounts/actions";
import type { Account } from "@prisma/client";

interface AccountDeleteButtonProps {
  account: Account;
}

export function AccountDeleteButton({ account }: AccountDeleteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount(account.id);
      if (!result.success) {
        setError(result.error ?? "Delete failed");
        setConfirming(false);
      }
    });
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500 max-w-[180px] truncate" title={error}>
          {error}
        </span>
        <button
          onClick={() => setError(null)}
          className="rounded-md px-2 py-1 text-xs text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          OK
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-tertiary hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      Delete
    </button>
  );
}
