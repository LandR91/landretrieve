"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@landretrieve.com", password: "Admin@LandR2025!" },
  { label: "Agenzia", email: "info@tuscanyestates.it", password: "Agency1@Test!" },
  { label: "Agente", email: "marco.rossi@tuscanyestates.it", password: "Agent@Test123!" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email o password non corretti. Riprova.");
    } else {
      router.push("/dashboard");
    }
  }

  function fillDemo(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ color: "#26A55B" }}>LandRetrieve.com</span>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "#4b5563" }}>
            Accedi al tuo account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: "#D4D4D4" }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="label-text mb-1.5 block" style={{ color: "#374151" }}>
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.com"
                className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  borderColor: "#D4D4D4",
                  color: "#111111",
                  "--tw-ring-color": "#26A55B",
                } as React.CSSProperties}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="label-text" style={{ color: "#374151" }}>
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "#26A55B" }}
                >
                  Hai dimenticato la password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border px-3 py-2.5 pr-10 text-sm outline-none transition-colors"
                  style={{ borderColor: "#D4D4D4", color: "#111111" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#4b5563" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Errore */}
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#26A55B" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1d8a4b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Accedi
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t" style={{ borderColor: "#D4D4D4" }} />
            <span className="text-xs" style={{ color: "#4b5563" }}>oppure</span>
            <div className="flex-1 border-t" style={{ borderColor: "#D4D4D4" }} />
          </div>

          {/* Demo accounts */}
          <div>
            <p className="label-text mb-2 text-center" style={{ color: "#4b5563" }}>
              Account demo
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors"
                  style={{ borderColor: "#D4D4D4", color: "#374151" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#26A55B";
                    e.currentTarget.style.backgroundColor = "#f0fbf5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#D4D4D4";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span className="font-medium">{acc.label}</span>
                  <span style={{ color: "#4b5563" }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm" style={{ color: "#4b5563" }}>
          Non hai ancora un account?{" "}
          <Link href="/registrati" className="font-medium hover:underline" style={{ color: "#26A55B" }}>
            Registrati gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
