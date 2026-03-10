import { formatCents } from "@/lib/format";

interface TransactionSummaryProps {
  summary: {
    incomeCents: number;
    expensesCents: number;
    balanceCents: number;
  };
}

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  const { incomeCents, expensesCents, balanceCents } = summary;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-text-secondary">Income</p>
        <p className="mt-0.5 text-base font-semibold text-accent">
          {formatCents(incomeCents)}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-text-secondary">Expenses</p>
        <p className="mt-0.5 text-base font-semibold text-red-500">
          -{formatCents(expensesCents)}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-text-secondary">Balance</p>
        <p
          className={`mt-0.5 text-base font-semibold ${balanceCents >= 0 ? "text-accent" : "text-red-500"}`}
        >
          {balanceCents < 0 ? "-" : ""}
          {formatCents(Math.abs(balanceCents))}
        </p>
      </div>
    </div>
  );
}
