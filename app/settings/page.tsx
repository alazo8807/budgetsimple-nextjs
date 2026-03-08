import { Suspense } from "react";
import { getAccounts, groupAccounts } from "@/lib/accounts/queries";
import { SettingsTabs, type SettingsTab } from "./_components/settings-tabs";
import { AccountsTab } from "./_components/accounts-tab";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const VALID_TABS: SettingsTab[] = ["appearance", "categories", "accounts"];

export default async function SettingsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const tabParam = typeof rawParams.tab === "string" ? rawParams.tab : "accounts";
  const activeTab: SettingsTab = VALID_TABS.includes(tabParam as SettingsTab)
    ? (tabParam as SettingsTab)
    : "accounts";

  const accounts = await getAccounts();
  const groups = groupAccounts(accounts);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="font-serif text-3xl text-foreground">Settings</h1>
        </div>

        <Suspense fallback={null}>
          <SettingsTabs activeTab={activeTab} />
        </Suspense>

        <div className="mt-6">
          {activeTab === "accounts" && (
            <AccountsTab groups={groups} allAccounts={accounts} />
          )}
          {activeTab === "appearance" && (
            <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center animate-fade-in">
              <p className="text-text-secondary">Appearance settings coming soon.</p>
            </div>
          )}
          {activeTab === "categories" && (
            <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center animate-fade-in">
              <p className="text-text-secondary">Category management coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
