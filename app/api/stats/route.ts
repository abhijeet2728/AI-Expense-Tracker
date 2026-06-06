// app/api/stats/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.user.id;

  // current month date range
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [thisMonthExpenses, allExpenses, totalCount] = await Promise.all([
    // this month's expenses for totals + category breakdown
    prisma.expense.findMany({
      where: {
        userId: uid,
        date:   { gte: monthStart, lte: monthEnd },
      },
      select: { amount: true, category: true },
    }),

    // last 6 months for trend
    prisma.expense.findMany({
      where: {
        userId: uid,
        date:   { gte: sixMonthsAgo },
      },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),

    // all-time count
    prisma.expense.count({ where: { userId: uid } }),
  ]);

  // total this month
  const total = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // category breakdown
  const categoryMap = new Map<string, number>();
  for (const e of thisMonthExpenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + Number(e.amount));
  }
  const categories = [...categoryMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // monthly trend — group by YYYY-MM
  const monthMap = new Map<string, number>();
  for (const e of allExpenses) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(e.amount));
  }
  const monthly = [...monthMap.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({ total, categories, monthly, count: totalCount });
}