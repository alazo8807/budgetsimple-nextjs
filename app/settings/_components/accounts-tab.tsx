"use client";

import { useState } from "react";
import type { Account } from "@prisma/client";
import { type AccountGroup } from "@/lib/accounts/queries";
import { formatAccountType } from "@/lib/format";
import { AccountFormDialog } from "./account-form-dialog";
import { AccountDeleteButton } from "./account-delete-button";

const GROUP_ICONS: Record<string, string> = {
  wallet: "\u{1F4B3}",
  "piggy-bank": "\u{1F416}",
  "trending-up": "\u{1F4C8}",
  landmark: "\u{1F3E6}",
};

interface AccountsTabProps {
  groups: AccountGroup[];
  allAccounts: Account[];
}

export function AccountsTab({ groups, allAccounts }: AccountsTabProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsCreating(true)}
        className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-medium text-text-secondary transition-all hover:border-accent hover:text-accent hover:bg-accent-muted"
      >
        + Add Account
      </button>

      {allAccounts.length === 0 && (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center animate-fade-in">
          <p className="text-text-secondary text-base">No accounts yet</p>
          <p className="text-text-tertiary text-sm mt-1">
            Add an account to start tracking transactions.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <div
          key={group.label}
          className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm animate-fade-in-up"
        >
          <div className="px-5 py-3.5 border-b border-border-light">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>{GROUP_ICONS[group.icon] ?? ""}</span>
              {group.label}
              <span className="text-text-tertiary font-normal">
                ({group.accounts.length})
              </span>
            </h3>
          </div>
          <div className="divide-y divide-border-light">
            {group.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-sm">
                    {GROUP_ICONS[group.icon] ?? "\u{1F4B3}"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {account.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatAccountType(account.type)}
                      {account.last4 && ` \u00B7\u00B7${account.last4}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAccount(account)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    Edit
                  </button>
                  <AccountDeleteButton account={account} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {isCreating && (
        <AccountFormDialog onClose={() => setIsCreating(false)} />
      )}

      {editingAccount && (
        <AccountFormDialog
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
}
