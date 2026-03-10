"use client";

import { useActionState, useRef, useCallback, useState } from "react";
import { createBudget, updateBudget, type ActionResult } from "@/lib/budgets/actions";
import { formatMonth } from "@/lib/format";
import type { Category } from "@prisma/client";
import type { BudgetWithCategory } from "@/lib/budgets/queries";

interface BudgetFormModalProps {
  month: string;
  categories: (Category & { children: Category[] })[];
  budget?: BudgetWithCategory;
  open: boolean;
  onClose: () => void;
}

export function BudgetFormModal({
  month,
  categories,
  budget,
  open,
  onClose,
}: BudgetFormModalProps) {
  const isEditing = !!budget;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize from props — component is re-keyed by parent so these are stable
  const [budgetType, setBudgetType] = useState<"INCOME" | "EXPENSE">(
    budget ? (budget.category.type as "INCOME" | "EXPENSE") : "EXPENSE"
  );
  const [isRecurring, setIsRecurring] = useState(budget?.isRecurring ?? true);
  const [amountDisplay, setAmountDisplay] = useState(
    budget ? (budget.amountCents / 100).toFixed(2) : ""
  );

  const handleClose = useCallback(() => {
    formRef.current?.reset();
    onClose();
  }, [onClose]);

  // Wrap action to call onClose on success (avoids setState-in-effect)
  const baseAction = isEditing ? updateBudget : createBudget;
  const wrappedAction = useCallback(
    async (prevState: ActionResult | null, formData: FormData) => {
      const result = await baseAction(prevState, formData);
      if (result.success) handleClose();
      return result;
    },
    [baseAction, handleClose]
  );

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    wrappedAction,
    null
  );

  // Sync dialog open state via imperative API (no setState involved)
  const dialogCallbackRef = useCallback(
    (el: HTMLDialogElement | null) => {
      if (!el) return;
      (dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current = el;
      if (open && !el.open) {
        el.showModal();
      } else if (!open && el.open) {
        el.close();
      }
    },
    [open]
  );

  const parentCategories = categories.filter(
    (c) => !c.parentId && c.type === budgetType
  );
  const childCategories = categories.filter(
    (c) => c.parentId && c.type === budgetType
  );


  return (
    <dialog
      ref={dialogCallbackRef}
      onClose={handleClose}
      className="rounded-2xl border border-border p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm w-full max-w-md animate-fade-in-up m-auto"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              {isEditing ? "Edit Budget" : "Add Budget"}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {isEditing
                ? "Update your budget for this category"
                : `Create a budget for ${formatMonth(month)}`}
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
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="isRecurring" value={String(isRecurring)} />
          {isEditing && <input type="hidden" name="id" value={budget.id} />}
          {isEditing && <input type="hidden" name="categoryId" value={budget.categoryId} />}

          {/* Type toggle — only shown when creating */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetType("EXPENSE")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  budgetType === "EXPENSE"
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setBudgetType("INCOME")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  budgetType === "INCOME"
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Income
              </button>
            </div>
          )}

          {/* Category selector — only when creating */}
          {!isEditing && (
            <div>
              <label
                htmlFor="budget-category"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Category
              </label>
              <select
                id="budget-category"
                name="categoryId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="" disabled>
                  Select category
                </option>
                {parentCategories.map((parent) => {
                  const children = childCategories.filter(
                    (c) => c.parentId === parent.id
                  );
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
          )}

          {/* Amount */}
          <div>
            <label
              htmlFor="budget-amount"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              Budget Amount
            </label>
            <input
              id="budget-amount"
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(e.target.value)}
              required
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Recurring Budget</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {isRecurring
                  ? "Applies to this and all future months"
                  : "Only for this month"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                isRecurring ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  isRecurring ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
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
                  : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
