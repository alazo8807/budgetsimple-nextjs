import { format } from "date-fns";

export function formatCents(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export function parseDollarsTocents(dollars: string): number {
  const num = parseFloat(dollars);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function formatAccountType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatUTCDate(date: Date | string, fmt: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), fmt);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string): string {
  const [year, mon] = month.split("-");
  return new Date(Number(year), Number(mon) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
