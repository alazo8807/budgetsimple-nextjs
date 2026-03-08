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
