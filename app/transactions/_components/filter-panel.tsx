"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Account, Category } from "@prisma/client";
import { formatAccountType } from "@/lib/format";

type CategoryWithChildren = Category & { children: Category[] };

interface FilterPanelProps {
  accounts: Account[];
  categories: Category[];
}

function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) p.delete(key);
        else p.set(key, value);
      }
      p.delete("page");
      startTransition(() => router.push(`${pathname}?${p.toString()}`));
    },
    [router, pathname, searchParams]
  );

  const toggleMulti = useCallback(
    (key: string, id: string) => {
      const p = new URLSearchParams(searchParams.toString());
      const current = (p.get(key) ?? "").split(",").filter(Boolean);
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
      p.delete("page");
      startTransition(() => router.push(`${pathname}?${p.toString()}`));
    },
    [router, pathname, searchParams]
  );

  return { searchParams, pushParams, toggleMulti, isPending, router, pathname, startTransition };
}

function FilterPanelContent({
  accounts,
  categories,
  showTitle = true,
}: FilterPanelProps & { showTitle?: boolean }) {
  const { searchParams, pushParams, toggleMulti, isPending, router, pathname, startTransition } = useFilterParams();
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const activeType = searchParams.get("type") ?? "";
  const activeAccountIds = (searchParams.get("accountIds") ?? "")
    .split(",")
    .filter(Boolean);
  const activeCategoryIds = (searchParams.get("categoryIds") ?? "")
    .split(",")
    .filter(Boolean);

  const hasActiveFilters =
    !!activeType || activeAccountIds.length > 0 || activeCategoryIds.length > 0;

  function clearAll() {
    pushParams({ type: null, accountIds: null, categoryIds: null });
  }

  function toggleType(value: "INCOME" | "EXPENSE") {
    pushParams({ type: activeType === value ? null : value });
  }

  function toggleExpand(id: string) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const parentCategories = categories.filter(
    (c) => !c.parentId
  ) as CategoryWithChildren[];

  function leafIds(category: CategoryWithChildren): string[] {
    return category.children.length > 0
      ? category.children.map((c) => c.id)
      : [category.id];
  }

  function isParentChecked(category: CategoryWithChildren): boolean {
    return leafIds(category).every((id) => activeCategoryIds.includes(id));
  }

  function isParentIndeterminate(category: CategoryWithChildren): boolean {
    const ids = leafIds(category);
    const n = ids.filter((id) => activeCategoryIds.includes(id)).length;
    return n > 0 && n < ids.length;
  }

  function toggleParentCategory(category: CategoryWithChildren) {
    const ids = leafIds(category);
    const p = new URLSearchParams(searchParams.toString());
    const current = (p.get("categoryIds") ?? "").split(",").filter(Boolean);
    const isActive = ids.some((id) => current.includes(id));
    const next = isActive
      ? current.filter((id) => !ids.includes(id))
      : [...new Set([...current, ...ids])];
    if (next.length) p.set("categoryIds", next.join(","));
    else p.delete("categoryIds");
    p.delete("page");
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  }

  return (
    <div
      className={`transition-opacity duration-150 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Mobile header — "Filters" title + clear all */}
      {showTitle && (
        <div className="flex items-center justify-between pb-4">
          <span className="text-base font-semibold text-foreground">Filters</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-accent hover:text-accent/70 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Desktop "Clear all" — shown above sections when filters are active */}
      {!showTitle && hasActiveFilters && (
        <div className="pb-1 text-right">
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-accent hover:text-accent/70 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Quick filters — type chips */}
      <Section title="Quick filters">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { label: "Income", value: "INCOME" },
              { label: "Expenses", value: "EXPENSE" },
            ] as const
          ).map(({ label, value }) => (
            <Chip
              key={value}
              active={activeType === value}
              onClick={() => toggleType(value)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Accounts */}
      {accounts.length > 0 && (
        <Section title="Account">
          <div className="space-y-1">
            {accounts.map((account) => (
              <label
                key={account.id}
                className="flex cursor-pointer items-center justify-between py-2"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium text-foreground truncate">
                    {account.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatAccountType(account.type)}
                    {account.last4 ? ` · ..${account.last4}` : ""}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={activeAccountIds.includes(account.id)}
                  onChange={() => toggleMulti("accountIds", account.id)}
                  className="h-4 w-4 shrink-0 rounded border-border accent-foreground"
                />
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Categories */}
      {parentCategories.length > 0 && (
        <Section title="Category" defaultOpen={false}>
          <div className="space-y-0.5">
            {parentCategories.map((category) => {
              const hasChildren = category.children.length > 0;
              const isExpanded = expandedParents.has(category.id);

              return (
                <div key={category.id}>
                  {/* Parent row */}
                  <div className="flex items-center py-1.5">
                    <button
                      type="button"
                      onClick={() => hasChildren && toggleExpand(category.id)}
                      className={`mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${
                        hasChildren
                          ? "cursor-pointer text-text-tertiary hover:text-foreground"
                          : "invisible"
                      }`}
                      tabIndex={hasChildren ? 0 : -1}
                    >
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-foreground truncate">{category.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        ref={(el) => { if (el) el.indeterminate = isParentIndeterminate(category); }}
                        checked={isParentChecked(category)}
                        onChange={() => toggleParentCategory(category)}
                        className="h-4 w-4 shrink-0 rounded border-border accent-foreground"
                      />
                    </label>
                  </div>

                  {/* Children */}
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {category.children.map((child) => (
                        <label
                          key={child.id}
                          className="flex cursor-pointer items-center justify-between py-1.5"
                        >
                          <div className="flex min-w-0 items-center gap-2 pr-3">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full opacity-70"
                              style={{ backgroundColor: child.color }}
                            />
                            <span className="text-xs text-text-secondary truncate">{child.name}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={activeCategoryIds.includes(child.id)}
                            onChange={() => toggleMulti("categoryIds", child.id)}
                            className="h-3.5 w-3.5 shrink-0 rounded border-border accent-foreground"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ChevronDown
          size={15}
          className={`text-text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-foreground text-background"
          : "border border-border text-text-secondary hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ accounts, categories }: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeCount =
    (searchParams.get("type") ? 1 : 0) +
    (searchParams.get("accountIds") ?? "").split(",").filter(Boolean).length +
    (searchParams.get("categoryIds") ?? "").split(",").filter(Boolean).length;

  return (
    <>
      {/* Mobile toggle — visible below md */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors"
        >
          <SlidersHorizontal size={14} className="text-text-secondary" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={13}
            className={`ml-1 text-text-secondary transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-sm animate-fade-in-up px-4 pt-4">
            <FilterPanelContent accounts={accounts} categories={categories} showTitle={true} />
          </div>
        )}
      </div>

      {/* Desktop sidebar — always visible above md */}
      <aside className="hidden md:block w-60 shrink-0 self-start sticky top-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Filters</h2>
        <FilterPanelContent accounts={accounts} categories={categories} showTitle={false} />
      </aside>
    </>
  );
}
