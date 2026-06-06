// app/api/expenses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/* ── GET ─────────────────────────────────────────────────── */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take:    50,
    select: { id: true, title: true, amount: true, category: true, date: true, note: true, createdAt: true },
  });

  return NextResponse.json({ expenses });
}

/* ── POST ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, amount, category, date, note } = await req.json();
  if (!title || !amount || !category)
    return NextResponse.json({ error: "title, amount and category are required" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      userId:   session.user.id,
      title,
      amount:   Number(amount),
      category,
      date:     date ? new Date(date) : new Date(),
      note:     note ?? null,
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}

/* ── DELETE ──────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.expense.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}