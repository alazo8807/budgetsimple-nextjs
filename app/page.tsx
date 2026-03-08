import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background">
      <div className="text-center px-4 animate-fade-in-up">
        <h1 className="font-serif text-5xl tracking-tight text-foreground sm:text-6xl">
          BudgetSimple
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-md mx-auto leading-relaxed">
          Track your income and expenses with a simple, clean interface.
        </p>
        <Link
          href="/transactions"
          className="mt-10 inline-flex items-center rounded-lg bg-accent px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          View Transactions
        </Link>
      </div>
    </div>
  );
}
