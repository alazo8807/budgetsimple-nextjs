"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { id: "appearance", label: "Appearance" },
  { id: "categories", label: "Categories" },
  { id: "accounts", label: "Accounts" },
] as const;

export type SettingsTab = (typeof TABS)[number]["id"];

export function SettingsTabs({ activeTab }: { activeTab: SettingsTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent"
              : "text-text-tertiary hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
