// app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "@/app/dashboard/Dashboardclient";

export const metadata = { title: "Dashboard — SpendWise AI" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const uid        = session.user.id;
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const sixAgo     = new Date(); sixAgo.setMonth(sixAgo.getMonth() - 6);

  const [thisMonthExpenses, trendExpenses, recentExpenses, totalCount] =
    await Promise.all([
      prisma.expense.findMany({
        where:  { userId: uid, date: { gte: monthStart, lte: monthEnd } },
        select: { amount: true, category: true },
      }),
      prisma.expense.findMany({
        where:   { userId: uid, date: { gte: sixAgo } },
        select:  { amount: true, date: true },
        orderBy: { date: "asc" },
      }),
      prisma.expense.findMany({
        where:   { userId: uid },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take:    8,
        select:  { id: true, title: true, amount: true, category: true, date: true, note: true },
      }),
      prisma.expense.count({ where: { userId: uid } }),
    ]);

  // total this month
  const totalThisMonth = thisMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);

  // category breakdown
  const catMap = new Map<string, number>();
  for (const e of thisMonthExpenses)
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
  const categories = [...catMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // 6-month trend
  const monthMap = new Map<string, number>();
  for (const e of trendExpenses) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(e.amount));
  }
  const monthly = [...monthMap.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <DashboardClient
      user={{
        id:    uid,
        name:  session.user.name  ?? "User",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      stats={{ totalThisMonth, categories, monthly, totalCount }}
      initialExpenses={recentExpenses.map((e) => ({
        id:       e.id,
        title:    e.title,
        amount:   Number(e.amount),
        category: e.category,
        date:     e.date.toISOString().slice(0, 10),
        note:     e.note ?? "",
      }))}
    />
  );
}