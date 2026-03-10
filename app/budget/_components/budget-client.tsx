"use client";

import { Suspense, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Pencil, Trash2, Plus } from "lucide-react";
import { MonthPicker } from "@/app/_components/month-picker";
import { deleteBudget } from "@/lib/budgets/actions";
import { formatCents, getCurrentMonth } from "@/lib/format";
import type { Category } from "@prisma/client";
import type { BudgetWithCategory } from "@/lib/budgets/queries";

const BudgetFormModal = dynamic(
  () => import("./budget-form-modal").then((m) => m.BudgetFormModal),
  { ssr: false }
);

interface BudgetClientProps {
  month: string;
  budgets: BudgetWithCategory[];
  spending: Record<string, number>;
  categories: (Category & { children: Category[] })[];
}

export function BudgetClient({
  month,
  budgets,
  spending,
  categories,
}: BudgetClientProps) {
  const isPastMonth = month < getCurrentMonth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const expenseBudgets = budgets.filter((b) => b.category.type === "EXPENSE");
  const incomeBudgets = budgets.filter((b) => b.category.type === "INCOME");

  const totalExpenseBudget = expenseBudgets.reduce((s, b) => s + b.amountCents, 0);
  const totalExpenseSpent = expenseBudgets.reduce(
    (s, b) => s + (spending[b.categoryId] ?? 0),
    0
  );
  const totalIncomeBudget = incomeBudgets.reduce((s, b) => s + b.amountCents, 0);
  const totalIncomeSpent = incomeBudgets.reduce(
    (s, b) => s + (spending[b.categoryId] ?? 0),
    0
  );
  const leftOver = totalIncomeBudget - totalExpenseBudget;

  function getCategoryDisplayName(budget: BudgetWithCategory): string {
    const cat = budget.category;
    if (cat.parent) return `${cat.parent.name}: ${cat.name}`;
    return cat.name;
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteBudget(id);
      if (!result.success) {
        setDeleteError(result.error ?? "Failed to delete.");
      }
      setDeletingId(null);
    });
  }

  function openEdit(budget: BudgetWithCategory) {
    setEditingBudget(budget);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBudget(null);
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-foreground">Budget</h1>
          {!isPastMonth && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:shadow-md hover:shadow-accent/15"
            >
              <Plus className="h-4 w-4" />
              Add a budget
            </button>
          )}
        </div>

        {/* Month picker */}
        <Suspense fallback={null}>
          <MonthPicker />
        </Suspense>

        {deleteError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {deleteError}
          </p>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Spending + Income */}
          <div className="space-y-6 lg:col-span-2">
            {/* Spending */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Spending</h2>
                <span className="text-sm text-text-secondary">
                  {formatCents(totalExpenseSpent)} of {formatCents(totalExpenseBudget)}
                </span>
              </div>

              {expenseBudgets.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">
                  No spending budgets set for this month
                </p>
              ) : (
                <div className="space-y-5">
                  {expenseBudgets.map((budget) => (
                    <BudgetRow
                      key={budget.id}
                      budget={budget}
                      spent={spending[budget.categoryId] ?? 0}
                      displayName={getCategoryDisplayName(budget)}
                      isPastMonth={isPastMonth}
                      isDeleting={deletingId === budget.id}
                      onEdit={() => openEdit(budget)}
                      onDeleteRequest={() => setDeletingId(budget.id)}
                      onDeleteConfirm={() => handleDelete(budget.id)}
                      onDeleteCancel={() => setDeletingId(null)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Income */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Income</h2>
                <span className="text-sm text-text-secondary">
                  {formatCents(totalIncomeSpent)} of{" "}
                  {formatCents(totalIncomeBudget)}
                </span>
              </div>

              {incomeBudgets.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">
                  No income budgets set for this month
                </p>
              ) : (
                <div className="space-y-5">
                  {incomeBudgets.map((budget) => (
                    <BudgetRow
                      key={budget.id}
                      budget={budget}
                      spent={spending[budget.categoryId] ?? 0}
                      displayName={getCategoryDisplayName(budget)}
                      isPastMonth={isPastMonth}
                      isDeleting={deletingId === budget.id}
                      onEdit={() => openEdit(budget)}
                      onDeleteRequest={() => setDeletingId(budget.id)}
                      onDeleteConfirm={() => handleDelete(budget.id)}
                      onDeleteCancel={() => setDeletingId(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Your budgets</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Income</span>
                  <span className="text-sm font-semibold text-accent">
                    {formatCents(totalIncomeBudget)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Spending</span>
                  <span className="text-sm font-semibold text-red-500">
                    -{formatCents(totalExpenseBudget)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Left over</span>
                    <span
                      className={`text-sm font-semibold ${leftOver >= 0 ? "text-accent" : "text-red-500"}`}
                    >
                      {leftOver < 0 ? "-" : ""}
                      {formatCents(Math.abs(leftOver))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create modal — re-keyed so it always mounts fresh */}
      <BudgetFormModal
        key="create"
        month={month}
        categories={categories}
        open={modalOpen && !editingBudget}
        onClose={closeModal}
      />

      {/* Edit modal — re-keyed per budget so state initializes fresh */}
      <BudgetFormModal
        key={editingBudget?.id ?? "edit-empty"}
        month={month}
        categories={categories}
        budget={editingBudget ?? undefined}
        open={!!editingBudget}
        onClose={closeModal}
      />
    </>
  );
}

interface BudgetRowProps {
  budget: BudgetWithCategory;
  spent: number;
  displayName: string;
  isPastMonth: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function BudgetRow({
  budget,
  spent,
  displayName,
  isPastMonth,
  isDeleting,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: BudgetRowProps) {
  const isExpense = budget.category.type === "EXPENSE";
  const isOverBudget = isExpense && spent > budget.amountCents;
  const percentage =
    budget.amountCents > 0
      ? Math.min((spent / budget.amountCents) * 100, 100)
      : 0;
  const remaining = budget.amountCents - spent;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          {budget.isRecurring && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-surface-hover text-text-secondary border border-border-light">
              Recurring
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpense ? (
            <span className={`text-sm ${isOverBudget ? "text-red-500 font-medium" : "text-text-secondary"}`}>
              {isOverBudget
                ? `-${formatCents(Math.abs(remaining))} over`
                : `${formatCents(remaining)} left`}
            </span>
          ) : (
            <span className="text-sm text-text-secondary">
              {formatCents(remaining)} to go
            </span>
          )}
          {!isPastMonth && !isDeleting && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={onEdit}
                className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
                aria-label="Edit budget"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDeleteRequest}
                className="rounded-md p-1 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Delete budget"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {!isPastMonth && isDeleting && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Delete?</span>
              <button
                onClick={onDeleteConfirm}
                className="rounded px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Yes
              </button>
              <button
                onClick={onDeleteCancel}
                className="rounded px-2 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-border-light">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? "#ef4444" : budget.category.color,
          }}
        />
      </div>

      <p className="mt-1 text-xs text-text-secondary">
        {formatCents(spent)} of {formatCents(budget.amountCents)}
      </p>
    </div>
  );
}
