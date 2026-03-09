"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export function TransactionsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams]
  );

  return (
    <input
      type="text"
      placeholder="Search transactions..."
      defaultValue={searchParams.get("search") ?? ""}
      onChange={(e) => updateParam("search", e.target.value)}
      className={`rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-48 sm:w-64 transition-opacity ${
        isPending ? "opacity-70" : ""
      }`}
    />
  );
}
