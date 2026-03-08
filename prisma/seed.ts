import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { id: "cat_housing", name: "Housing", color: "#14b8a6", type: "EXPENSE" as const, parentId: null },
  { id: "cat_mortgage", name: "Mortgage", color: "#14b8a6", type: "EXPENSE" as const, parentId: "cat_housing" },
  { id: "cat_utilities", name: "Utilities", color: "#0d9488", type: "EXPENSE" as const, parentId: "cat_housing" },
  { id: "cat_maintenance", name: "Maintenance", color: "#0f766e", type: "EXPENSE" as const, parentId: "cat_housing" },

  { id: "cat_food", name: "Food & Dining", color: "#3b82f6", type: "EXPENSE" as const, parentId: null },
  { id: "cat_groceries", name: "Groceries", color: "#3b82f6", type: "EXPENSE" as const, parentId: "cat_food" },
  { id: "cat_restaurants", name: "Restaurants", color: "#2563eb", type: "EXPENSE" as const, parentId: "cat_food" },

  { id: "cat_transport", name: "Transport", color: "#f97316", type: "EXPENSE" as const, parentId: null },
  { id: "cat_gas", name: "Gas", color: "#f97316", type: "EXPENSE" as const, parentId: "cat_transport" },
  { id: "cat_transit", name: "Public Transit", color: "#ea580c", type: "EXPENSE" as const, parentId: "cat_transport" },

  { id: "cat_shopping", name: "Shopping", color: "#22c55e", type: "EXPENSE" as const, parentId: null },
  { id: "cat_entertainment", name: "Entertainment", color: "#f59e0b", type: "EXPENSE" as const, parentId: null },
  { id: "cat_bills", name: "Bills & Utilities", color: "#ef4444", type: "EXPENSE" as const, parentId: null },
  { id: "cat_health", name: "Health & Fitness", color: "#8b5cf6", type: "EXPENSE" as const, parentId: null },
  { id: "cat_education", name: "Education", color: "#6366f1", type: "EXPENSE" as const, parentId: null },
  { id: "cat_other", name: "Other", color: "#64748b", type: "EXPENSE" as const, parentId: null },

  { id: "cat_salary", name: "Salary", color: "#22c55e", type: "INCOME" as const, parentId: null },
  { id: "cat_freelance", name: "Freelance", color: "#14b8a6", type: "INCOME" as const, parentId: null },

  { id: "cat_investments", name: "Investments", color: "#3b82f6", type: "INCOME" as const, parentId: null },
  { id: "cat_dividends", name: "Dividends", color: "#3b82f6", type: "INCOME" as const, parentId: "cat_investments" },
  { id: "cat_capital_gains", name: "Capital Gains", color: "#2563eb", type: "INCOME" as const, parentId: "cat_investments" },
];

const accounts = [
  { id: "acct_td_checking", name: "TD Bank Checking", type: "CHECKING" as const, institution: "TD Bank", last4: "4521" },
  { id: "acct_rb_credit", name: "Royal Bank MasterCard", type: "CREDIT_CARD" as const, institution: "Royal Bank", last4: "6124" },
  { id: "acct_hi_savings", name: "High Interest Savings", type: "SAVINGS" as const, institution: "EQ Bank", last4: "1234" },
  { id: "acct_visa_debit", name: "Visa Debit", type: "CASH" as const, institution: "TD Bank", last4: "9832" },
];

const transactions = [
  // --- January 2026 ---
  { date: "2026-01-01", description: "Salary Deposit", amountCents: 520000, type: "INCOME" as const, accountId: "acct_td_checking", categoryId: "cat_salary" },
  { date: "2026-01-02", description: "Mortgage Payment", amountCents: 185000, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_mortgage" },
  { date: "2026-01-03", description: "Costco Groceries", amountCents: 15432, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_groceries" },
  { date: "2026-01-05", description: "Gas Station Fill-up", amountCents: 6500, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_gas" },
  { date: "2026-01-07", description: "Sushi Restaurant", amountCents: 8750, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_restaurants" },
  { date: "2026-01-08", description: "Netflix Subscription", amountCents: 1599, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_entertainment" },
  { date: "2026-01-10", description: "Electric Bill", amountCents: 12400, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_utilities" },
  { date: "2026-01-12", description: "Grocery Run", amountCents: 9823, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_groceries" },
  { date: "2026-01-14", description: "Gym Membership", amountCents: 4999, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_health" },
  { date: "2026-01-15", description: "Freelance Project", amountCents: 150000, type: "INCOME" as const, accountId: "acct_td_checking", categoryId: "cat_freelance" },
  { date: "2026-01-17", description: "Pizza Night", amountCents: 4250, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_restaurants" },
  { date: "2026-01-20", description: "Internet Bill", amountCents: 7999, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_bills" },
  { date: "2026-01-22", description: "Weekend Groceries", amountCents: 11250, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_groceries" },
  { date: "2026-01-25", description: "New Running Shoes", amountCents: 12999, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_shopping" },
  { date: "2026-01-28", description: "Dividend Payment", amountCents: 8500, type: "INCOME" as const, accountId: "acct_hi_savings", categoryId: "cat_dividends" },

  // --- February 2026 ---
  { date: "2026-02-01", description: "Salary Deposit", amountCents: 520000, type: "INCOME" as const, accountId: "acct_td_checking", categoryId: "cat_salary" },
  { date: "2026-02-02", description: "Mortgage Payment", amountCents: 185000, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_mortgage" },
  { date: "2026-02-04", description: "Costco Groceries", amountCents: 16200, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_groceries" },
  { date: "2026-02-06", description: "Public Transit Pass", amountCents: 11600, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_transit" },
  { date: "2026-02-08", description: "Thai Restaurant", amountCents: 6450, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_restaurants" },
  { date: "2026-02-10", description: "Electric Bill", amountCents: 11800, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_utilities" },
  { date: "2026-02-11", description: "Online Course", amountCents: 4999, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_education" },
  { date: "2026-02-14", description: "Valentine's Dinner", amountCents: 15500, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_restaurants" },
  { date: "2026-02-15", description: "Freelance Project", amountCents: 200000, type: "INCOME" as const, accountId: "acct_td_checking", categoryId: "cat_freelance" },
  { date: "2026-02-18", description: "Grocery Run", amountCents: 8750, type: "EXPENSE" as const, accountId: "acct_visa_debit", categoryId: "cat_groceries" },
  { date: "2026-02-20", description: "Internet Bill", amountCents: 7999, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_bills" },
  { date: "2026-02-22", description: "Plumber Visit", amountCents: 25000, type: "EXPENSE" as const, accountId: "acct_td_checking", categoryId: "cat_maintenance" },
  { date: "2026-02-25", description: "New Headphones", amountCents: 19999, type: "EXPENSE" as const, accountId: "acct_rb_credit", categoryId: "cat_shopping" },
  { date: "2026-02-28", description: "Dividend Payment", amountCents: 8500, type: "INCOME" as const, accountId: "acct_hi_savings", categoryId: "cat_dividends" },
];

async function main() {
  console.log("Seeding categories...");
  const parentCategories = categories.filter((c) => c.parentId === null);
  const childCategories = categories.filter((c) => c.parentId !== null);

  for (const cat of parentCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, color: cat.color, type: cat.type },
      create: { id: cat.id, name: cat.name, color: cat.color, type: cat.type },
    });
  }
  for (const cat of childCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, color: cat.color, type: cat.type, parentId: cat.parentId },
      create: { id: cat.id, name: cat.name, color: cat.color, type: cat.type, parentId: cat.parentId },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  console.log("Seeding accounts...");
  for (const acct of accounts) {
    await prisma.account.upsert({
      where: { id: acct.id },
      update: { name: acct.name, type: acct.type, institution: acct.institution, last4: acct.last4 },
      create: { id: acct.id, name: acct.name, type: acct.type, institution: acct.institution, currency: "USD", last4: acct.last4 },
    });
  }
  console.log(`Seeded ${accounts.length} accounts.`);

  console.log("Seeding transactions...");
  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        date: new Date(tx.date),
        description: tx.description,
        amountCents: tx.amountCents,
        type: tx.type,
        accountId: tx.accountId,
        categoryId: tx.categoryId,
      },
    });
  }
  console.log(`Seeded ${transactions.length} transactions.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
