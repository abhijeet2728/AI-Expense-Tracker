import type { Metadata } from "next";
import GoogleSignInButton from "@/components/SignIn";

/* ── SVG Icons ─────────────────────────────────────────────── */

const SpendWiseIcon = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
    <rect width="38" height="38" rx="11" fill="#f97316" />
    <circle cx="19" cy="19" r="9" stroke="white" strokeWidth="1.8" strokeOpacity="0.4" />
    <path d="M19 13v1.5M19 23.5V25M14 19h-1.5M25.5 19H24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="19" cy="19" r="3.5" fill="white" />
    <path d="M19 16.8v1l-1 1.2 1 1.2v1" stroke="#f97316" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 14l4-4 3 3 6-7" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 6h4v4" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L3 5v4c0 4 2.7 7.7 7 9 4.3-1.3 7-5 7-9V5L10 2z" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10l2 2 4-4" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="10" r="3" fill="#f97316" />
  </svg>
);

/* ── Static data ───────────────────────────────────────────── */

const features = [
  {
    icon: <SparkIcon />,
    title: "AI-Powered Insights",
    desc: "Smart categorization and spending predictions powered by machine learning.",
  },
  {
    icon: <ChartIcon />,
    title: "Real-Time Analytics",
    desc: "Visual dashboards that update instantly as you spend.",
  },
  {
    icon: <ShieldIcon />,
    title: "Smart Financial Insights",
    desc: "Receive helpful recommendations and spending trends tailored to your habits, so you can make better money decisions.",
  },
];

const stats = [
  { value: "2.4M+", label: "Transactions" },
  { value: "₹840Cr", label: "Savings found" },
  { value: "98%", label: "Accuracy" },
];

/* ── Metadata ──────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Sign In — SpendWise AI",
  description: "AI-powered expense tracking and financial insights.",
};

/* ── Page ──────────────────────────────────────────────────── */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex font-sans bg-orange-50">

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-[1.1] flex-col justify-between px-14 py-12 relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">

        {/* Blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-white/[0.07] -top-28 -right-24 pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-white/[0.05] -bottom-16 -left-20 pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full bg-white/[0.08] bottom-52 right-16 pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <SpendWiseIcon />
          <div>
            <p className="text-white font-bold text-lg leading-tight">SpendWise AI</p>
            <p className="text-white/60 text-[11px] uppercase tracking-widest mt-0.5">Expense Intelligence</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h1 className="text-white font-bold text-4xl leading-tight mb-4">
            Your money,<br />
            <span className="text-white/80">finally</span> understood.
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
            AI that learns your spending habits, flags unusual charges, and tells you
            exactly where to cut back — automatically.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 flex flex-col gap-2.5">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3.5 bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.16]"
            >
              <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-[13.5px] font-semibold mb-0.5">{f.title}</p>
                <p className="text-white/65 text-[12.5px] leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-white/[0.13] border border-white/20 rounded-full py-2.5 text-center"
            >
              <p className="text-white font-bold text-[17px] tracking-tight">{s.value}</p>
              <p className="text-white/60 text-[11px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <main className="flex-[0.9] bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Auth card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-9">

            {/* Card brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <SpendWiseIcon />
              <span className="font-semibold text-gray-900 text-base">SpendWise AI</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Sign in to continue tracking your expenses with AI.
            </p>

            {/* Google button — client component */}
            <GoogleSignInButton callbackUrl="/dashboard" />

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11.5px] text-gray-400 whitespace-nowrap">
                Secure sign-in via Google OAuth
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Trust badges */}
            <div className="flex justify-center gap-4 flex-wrap">
              {["256-bit SSL", "SOC 2 certified", "No card required"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[11.5px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>

          </div>

          {/* Legal */}
          <p className="text-center text-[11.5px] text-gray-400 mt-5 leading-relaxed">
            By signing in you agree to our{" "}
            <a href="/terms" className="text-orange-500 hover:underline font-medium">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-orange-500 hover:underline font-medium">Privacy Policy</a>.
          </p>

        </div>
      </main>

    </div>
  );
}