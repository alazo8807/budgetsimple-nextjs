"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthParam = searchParams.get("month");
  const now = new Date();
  const currentYear = monthParam
    ? parseInt(monthParam.split("-")[0])
    : now.getFullYear();
  const currentMonth = monthParam
    ? parseInt(monthParam.split("-")[1])
    : now.getMonth() + 1;

  const updateParams = useCallback(
    (year: number, month: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", `${year}-${String(month).padStart(2, "0")}`);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const changeYear = useCallback(
    (delta: number) => {
      updateParams(currentYear + delta, currentMonth);
    },
    [currentYear, currentMonth, updateParams]
  );

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => changeYear(-1)}
          className="rounded-md px-2 py-1 text-lg text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Previous year"
        >
          &lsaquo;
        </button>
        <span className="font-serif text-xl min-w-[4rem] text-center tabular-nums">
          {currentYear}
        </span>
        <button
          onClick={() => changeYear(1)}
          className="rounded-md px-2 py-1 text-lg text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Next year"
        >
          &rsaquo;
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {MONTHS.map((label, i) => {
          const month = i + 1;
          const isActive = month === currentMonth;
          return (
            <button
              key={label}
              onClick={() => updateParams(currentYear, month)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border text-text-secondary hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
