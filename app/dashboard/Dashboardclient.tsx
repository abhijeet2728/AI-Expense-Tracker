// app/dashboard/DashboardClient.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/* ── Types ─────────────────────────────────────────────────── */
interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}
interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
}
interface CategoryStat { category: string; total: number; }
interface MonthlyStat  { month: string;    total: number; }
interface Stats {
  totalThisMonth: number;
  categories:     CategoryStat[];
  monthly:        MonthlyStat[];
  totalCount:     number;
}
interface Props { user: User; stats: Stats; initialExpenses: Expense[]; }

/* ── Constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Health", "Utilities", "Rent", "Education", "Travel", "Other",
];
const CAT_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316", Transport: "#3b82f6", Shopping: "#8b5cf6",
  Entertainment: "#ec4899", Health: "#22c55e", Utilities: "#f59e0b",
  Rent: "#ef4444", Education: "#06b6d4", Travel: "#14b8a6", Other: "#9ca3af",
};

/* ── Helpers ───────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short" });
};

/* ── Icons ─────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 4h11M5 4V3h5v1M6 7v4M9 7v4M3 4l1 9h7l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SpendWiseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
    <rect width="38" height="38" rx="11" fill="#f97316" />
    <circle cx="19" cy="19" r="9" stroke="white" strokeWidth="1.8" strokeOpacity="0.35" />
    <path d="M19 13v1.5M19 24.5V26M14 19h-1.5M26 19h-1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="19" cy="19" r="3.5" fill="white" />
  </svg>
);
const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2L1 20h20L11 2z" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 9v4M11 16v.5" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ── Confirm Dialog ─────────────────────────────────────────── */
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <WarningIcon />
          </div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>

        {/* message */}
        <p className="text-sm text-gray-500 leading-relaxed mb-6 pl-[52px]">
          {message}
        </p>

        {/* actions */}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function DashboardClient({ user, stats, initialExpenses }: Props) {
  const [expenses, setExpenses]   = useState<Expense[]>(initialExpenses);
  const [showModal, setShowModal] = useState(false);

  /* confirm dialog state */
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    onConfirm: () => void;
  } | null>(null);

  /* form state */
  const [form, setForm] = useState({
    title: "", amount: "", category: "Food & Dining",
    date: new Date().toISOString().slice(0, 10), note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  /* live totals */
  const [liveTotal, setLiveTotal] = useState(stats.totalThisMonth);
  const [liveCats,  setLiveCats]  = useState<CategoryStat[]>(stats.categories);

  /* ── Helpers ──────────────────────────────────────────────── */
  const openConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmConfig(null);
  };

  /* ── Sign out with confirm ───────────────────────────────── */
  const handleSignOutClick = () => {
    openConfirm({
      title: "Sign out?",
      message: "You'll be signed out of your SpendWise AI account and returned to the login page.",
      confirmLabel: "Sign out",
      confirmClass: "bg-gray-800 hover:bg-gray-900",
      onConfirm: () => {
        closeConfirm();
        signOut({ callbackUrl: "/login" });
      },
    });
  };

  /* ── Delete with confirm ─────────────────────────────────── */
  const handleDeleteClick = (expense: Expense) => {
    openConfirm({
      title: "Delete expense?",
      message: `"${expense.title}" (${fmt(expense.amount)}) will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      confirmClass: "bg-red-500 hover:bg-red-600",
      onConfirm: async () => {
        closeConfirm();
        // optimistic update
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        setLiveTotal((prev) => Math.max(0, prev - expense.amount));
        setLiveCats((prev) =>
          prev
            .map((c) => c.category === expense.category ? { ...c, total: Math.max(0, c.total - expense.amount) } : c)
            .filter((c) => c.total > 0)
        );
        await fetch("/api/expenses", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: expense.id }),
        });
      },
    });
  };

  /* ── Add expense ─────────────────────────────────────────── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:    form.title,
          amount:   parseFloat(form.amount),
          category: form.category,
          date:     form.date,
          note:     form.note,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { expense } = await res.json();

      setExpenses((prev) => [expense, ...prev].slice(0, 8));
      setLiveTotal((prev) => prev + expense.amount);
      setLiveCats((prev) => {
        const existing = prev.find((c) => c.category === expense.category);
        if (existing) {
          return prev.map((c) =>
            c.category === expense.category ? { ...c, total: c.total + expense.amount } : c
          );
        }
        return [...prev, { category: expense.category, total: expense.amount }].sort(
          (a, b) => b.total - a.total
        );
      });

      setForm({ title: "", amount: "", category: "Food & Dining", date: new Date().toISOString().slice(0, 10), note: "" });
      setShowModal(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const maxCat   = Math.max(...liveCats.map((c) => c.total), 1);
  const maxMonth = Math.max(...stats.monthly.map((m) => m.total), 1);

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── CONFIRM DIALOG ─────────────────────────────────── */}
      {confirmConfig && (
        <ConfirmDialog
          open={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          confirmClass={confirmConfig.confirmClass}
          onConfirm={confirmConfig.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SpendWiseIcon />
            <span className="font-bold text-gray-900 text-[15px]">SpendWise AI</span>
          </div>
          <div className="flex items-center gap-3">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-100" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-orange-100">
                {initials(user.name)}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-[11.5px] text-gray-400 leading-tight">{user.email}</p>
            </div>
            <button
              onClick={handleSignOutClick}
              className="ml-2 flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <SignOutIcon />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's your spending overview for {new Date().toLocaleString("default", { month: "long", year: "numeric" })}.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm shadow-orange-200"
          >
            <PlusIcon />
            Add Expense
          </button>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1">Spent this month</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{fmt(liveTotal)}</p>
            <div className="mt-3 h-1.5 rounded-full bg-orange-100 overflow-hidden">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (liveTotal / 50000) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">of ₹50,000 monthly goal</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1">Total transactions</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalCount}</p>
            <p className="text-[12px] text-gray-400 mt-3">All-time recorded expenses</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1">Top category</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {liveCats[0]?.category.split(" ")[0] ?? "—"}
            </p>
            {liveCats[0] && (
              <span
                className="inline-block mt-3 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: (CAT_COLORS[liveCats[0].category] ?? "#9ca3af") + "20", color: CAT_COLORS[liveCats[0].category] ?? "#9ca3af" }}
              >
                {fmt(liveCats[0].total)} this month
              </span>
            )}
          </div>
        </div>

        {/* ── CHARTS ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">By category</h2>
            {liveCats.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No expenses yet this month</p>
            ) : (
              <div className="space-y-3">
                {liveCats.map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12.5px] text-gray-700">{c.category}</span>
                      <span className="text-[12.5px] font-semibold text-gray-900">{fmt(c.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(c.total / maxCat) * 100}%`, background: CAT_COLORS[c.category] ?? "#9ca3af" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">6-month trend</h2>
            {stats.monthly.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Not enough data yet</p>
            ) : (
              <div className="flex items-end gap-3 h-36">
                {stats.monthly.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{fmt(m.total)}</span>
                    <div className="w-full rounded-t-lg bg-orange-100 overflow-hidden flex items-end" style={{ height: "80px" }}>
                      <div
                        className="w-full rounded-t-lg bg-orange-400 transition-all duration-700"
                        style={{ height: `${(m.total / maxMonth) * 100}%`, minHeight: "4px" }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RECENT EXPENSES ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent expenses</h2>
            <span className="text-[11.5px] text-gray-400">Latest 8</span>
          </div>
          {expenses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">No expenses yet — add your first one!</p>
            </div>
          ) : (
            <ul>
              {expenses.map((e, i) => (
                <li
                  key={e.id}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group ${i < expenses.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                    style={{ background: CAT_COLORS[e.category] ?? "#9ca3af" }}
                  >
                    {e.category.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-[11.5px] text-gray-400">
                      {e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{fmt(e.amount)}</span>
                  <button
                    onClick={() => handleDeleteClick(e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer ml-1"
                    aria-label="Delete expense"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* ── ADD EXPENSE MODAL ────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add expense</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Title</label>
                <input
                  required type="text" placeholder="e.g. Zomato order"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    required type="number" min="1" step="0.01" placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date" value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text" placeholder="Any extra detail"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-[13px]">{error}</p>}
              <button
                type="submit" disabled={saving}
                className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : "Save expense"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}