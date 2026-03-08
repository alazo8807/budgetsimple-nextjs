import { Suspense } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getTransactions, getCategories } from "@/lib/transactions/queries";
import { getAccounts } from "@/lib/accounts/queries";
import { transactionFilterSchema } from "@/lib/validation/transaction";
import { MonthPicker } from "./_components/month-picker";
import { TransactionsClient } from "./_components/transactions-client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value.length > 0) flat[key] = value[0];
  }

  if (!flat.month) {
    flat.month = format(new Date(), "yyyy-MM");
  }

  const filters = transactionFilterSchema.parse(flat);

  const [result, accounts, categories] = await Promise.all([
    getTransactions(filters),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-serif text-3xl text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track your income and expenses
          </p>
        </div>

        <div className="space-y-6">
          {accounts.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between animate-fade-in">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  No accounts configured
                </p>
                <p className="text-sm text-amber-600 mt-0.5">
                  Add an account in Settings before recording transactions.
                </p>
              </div>
              <Link
                href="/settings?tab=accounts"
                className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
              >
                Go to Settings
              </Link>
            </div>
          ) : null}

          <Suspense fallback={null}>
            <MonthPicker />
          </Suspense>

          <Suspense fallback={null}>
            <TransactionsClient
              accounts={accounts}
              categories={categories}
              transactions={result.transactions}
              total={result.total}
              page={result.page}
              pageSize={result.pageSize}
              totalPages={result.totalPages}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
