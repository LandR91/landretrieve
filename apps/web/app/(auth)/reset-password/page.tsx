"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Errore nella richiesta");
      setSent(true);
    } catch {
      setError("Si è verificato un errore. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ color: "#26A55B" }}>LandRetrieve.com</span>
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: "#D4D4D4" }}>
          {sent ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4" size={48} style={{ color: "#26A55B" }} />
              <h2 className="mb-2 text-xl font-semibold" style={{ color: "#111111" }}>
                Email inviata
              </h2>
              <p className="mb-6 text-sm" style={{ color: "#4b5563" }}>
                Se l'indirizzo <strong>{email}</strong> è registrato, riceverai a breve le istruzioni per reimpostare la password.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#26A55B" }}
              >
                Torna al login
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="mb-5 flex items-center gap-1 text-sm transition-colors hover:underline"
                style={{ color: "#4b5563" }}
              >
                <ArrowLeft size={16} /> Torna al login
              </Link>

              <h2 className="mb-1 text-xl font-semibold" style={{ color: "#111111" }}>
                Password dimenticata?
              </h2>
              <p className="mb-6 text-sm" style={{ color: "#4b5563" }}>
                Inserisci l'email del tuo account. Ti invieremo un link per reimpostare la password. Il link scade dopo 1 ora.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-text mb-1.5 block" style={{ color: "#374151" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.com"
                    className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: "#D4D4D4", color: "#111111" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
                  />
                </div>

                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#26A55B" }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Invia istruzioni
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
