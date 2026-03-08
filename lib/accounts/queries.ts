import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Account } from "@prisma/client";

export const getAccounts = cache(async () => {
  return prisma.account.findMany({
    orderBy: { name: "asc" },
  });
});

export type AccountGroup = {
  label: string;
  icon: string;
  accounts: Account[];
};

const GROUP_CONFIG: { label: string; icon: string; types: string[] }[] = [
  { label: "Spending", icon: "wallet", types: ["CHECKING", "CASH", "CREDIT_CARD"] },
  { label: "Saving", icon: "piggy-bank", types: ["SAVINGS"] },
  { label: "Investing", icon: "trending-up", types: ["INVESTMENT"] },
  { label: "Debt", icon: "landmark", types: ["LINE_OF_CREDIT"] },
];

export async function getAccountsGrouped(): Promise<AccountGroup[]> {
  const accounts = await getAccounts();

  return GROUP_CONFIG.map((group) => ({
    label: group.label,
    icon: group.icon,
    accounts: accounts.filter((a) => group.types.includes(a.type)),
  })).filter((g) => g.accounts.length > 0);
}

export function groupAccounts(accounts: Account[]): AccountGroup[] {
  return GROUP_CONFIG.map((group) => ({
    label: group.label,
    icon: group.icon,
    accounts: accounts.filter((a) => group.types.includes(a.type)),
  })).filter((g) => g.accounts.length > 0);
}
