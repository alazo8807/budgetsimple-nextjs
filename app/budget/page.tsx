import { getBudgetsForMonth, getSpendingForMonth } from "@/lib/budgets/queries";
import { getCategories } from "@/lib/transactions/queries";
import { getCurrentMonth } from "@/lib/format";
import { BudgetClient } from "./_components/budget-client";

interface BudgetPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? getCurrentMonth();

  const [budgets, spending, categories] = await Promise.all([
    getBudgetsForMonth(month),
    getSpendingForMonth(month),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <BudgetClient
        month={month}
        budgets={budgets}
        spending={spending}
        categories={categories}
      />
    </main>
  );
}
