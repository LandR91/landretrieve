"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Search, Building2, Handshake, ChevronLeft } from "lucide-react";
import { useRecaptcha } from "@/hooks/use-recaptcha";

type RoleType = "VISITOR" | "AGENCY" | "AGENT" | null;

const COUNTRIES = [
  "Italia", "Francia", "Germania", "Spagna", "Portogallo", "Regno Unito",
  "Stati Uniti", "Svizzera", "Belgio", "Paesi Bassi", "Austria", "Altro",
];

export default function RegistratiPage() {
  const router = useRouter();
  const { getToken } = useRecaptcha();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Campi comuni / per ruolo
  const [title, setTitle] = useState<"SIG" | "SIGRA">("SIG");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [country, setCountry] = useState("Italia");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [license, setLicense] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);

  const ROLES = [
    {
      id: "VISITOR" as RoleType,
      icon: <Search size={28} />,
      label: "Visitatore",
      desc: "Cerco immobili, faccio offerte, salvo preferiti",
      free: true,
    },
    {
      id: "AGENCY" as RoleType,
      icon: <Building2 size={28} />,
      label: "Agenzia",
      desc: "Gestisco un'agenzia immobiliare con team di agenti",
      free: false,
    },
    {
      id: "AGENT" as RoleType,
      icon: <Handshake size={28} />,
      label: "Agente / Broker",
      desc: "Sono un agente o broker indipendente",
      free: false,
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacy) { setError("Devi accettare la Privacy Policy per continuare."); return; }
    if (password !== confirmPassword) { setError("Le password non coincidono."); return; }
    setError("");
    setLoading(true);

    try {
      const recaptchaToken = await getToken("register");

      const endpoint =
        role === "VISITOR"
          ? "/api/auth/register/visitor"
          : role === "AGENCY"
            ? "/api/auth/register/agency"
            : "/api/auth/register/agent";

      const body =
        role === "VISITOR"
          ? { title, firstName, lastName, country, city: city || undefined, email, phone, password, confirmPassword }
          : role === "AGENCY"
            ? { agencyName, ownerName: ownerName || undefined, country, city: city || undefined, email, phone, taxNumber, license, password, confirmPassword, recaptchaToken }
            : { title, firstName, lastName, country, city: city || undefined, email, phone, taxNumber, license, password, confirmPassword, recaptchaToken };

      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(msg ?? "Registrazione fallita");
      }

      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors";
  const inputStyle = { borderColor: "#D4D4D4", color: "#111111" };
  const inputFocus = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "#26A55B"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "#D4D4D4"),
  };
  const labelClass = "label-text mb-1.5 block";

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="mx-auto w-full max-w-[520px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ color: "#26A55B" }}>LandRetrieve.com</span>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "#4b5563" }}>
            {step === 1 ? "Chi sei?" : "Crea il tuo account"}
          </p>
        </div>

        {/* ── STEP 1: selezione ruolo ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className="w-full rounded-xl border-2 p-5 text-left transition-colors"
                  style={{
                    borderColor: role === r.id ? "#26A55B" : "#D4D4D4",
                    backgroundColor: role === r.id ? "#f0fbf5" : "#fff",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: role === r.id ? "#e8f7ef" : "#f5f5f5",
                        color: role === r.id ? "#26A55B" : "#4b5563",
                      }}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold" style={{ color: "#111111" }}>{r.label}</p>
                        {r.free && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: "#e8f7ef", color: "#1a7a42" }}
                          >
                            Gratis
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: "#4b5563" }}>{r.desc}</p>
                    </div>
                    <div
                      className="h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: role === r.id ? "#26A55B" : "#D4D4D4" }}
                    >
                      {role === r.id && (
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#26A55B" }} />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!role}
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-md py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "#26A55B" }}
              onMouseEnter={(e) => role && (e.currentTarget.style.backgroundColor = "#1d8a4b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
            >
              Continua
            </button>

            <p className="mt-4 text-center text-sm" style={{ color: "#4b5563" }}>
              Hai già un account?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "#26A55B" }}>
                Accedi
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: form per ruolo ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: "#D4D4D4" }}>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              className="mb-5 flex items-center gap-1 text-sm transition-colors hover:underline"
              style={{ color: "#4b5563" }}
            >
              <ChevronLeft size={16} /> Cambia tipo account
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── VISITOR ─────────────────────────────────────────────── */}
              {role === "VISITOR" && (
                <>
                  <div>
                    <label className={labelClass} style={{ color: "#374151" }}>Titolo *</label>
                    <div className="flex gap-3">
                      {(["SIG", "SIGRA"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTitle(t)}
                          className="flex-1 rounded-md border py-2.5 text-sm font-medium transition-colors"
                          style={{
                            borderColor: title === t ? "#26A55B" : "#D4D4D4",
                            backgroundColor: title === t ? "#e8f7ef" : "#fff",
                            color: title === t ? "#1a7a42" : "#374151",
                          }}
                        >
                          {t === "SIG" ? "Sig." : "Sig.ra"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>Nome *</label>
                      <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Mario" />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>Cognome *</label>
                      <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Rossi" />
                    </div>
                  </div>
                </>
              )}

              {/* ── AGENCY ──────────────────────────────────────────────── */}
              {role === "AGENCY" && (
                <>
                  <div>
                    <label className={labelClass} style={{ color: "#374151" }}>Nome Agenzia *</label>
                    <input required value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Tuscany Estates" />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: "#374151" }}>Nome Proprietario *</label>
                    <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Mario Rossi" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>P.IVA *</label>
                      <input required value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="IT01234567890" />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>N° Licenza *</label>
                      <input required value={license} onChange={(e) => setLicense(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="FIAIP-001" />
                    </div>
                  </div>
                </>
              )}

              {/* ── AGENT ───────────────────────────────────────────────── */}
              {role === "AGENT" && (
                <>
                  <div>
                    <label className={labelClass} style={{ color: "#374151" }}>Titolo *</label>
                    <div className="flex gap-3">
                      {(["SIG", "SIGRA"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTitle(t)}
                          className="flex-1 rounded-md border py-2.5 text-sm font-medium transition-colors"
                          style={{
                            borderColor: title === t ? "#26A55B" : "#D4D4D4",
                            backgroundColor: title === t ? "#e8f7ef" : "#fff",
                            color: title === t ? "#1a7a42" : "#374151",
                          }}
                        >
                          {t === "SIG" ? "Sig." : "Sig.ra"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>Nome *</label>
                      <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Marco" />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>Cognome *</label>
                      <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="Rossi" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>P.IVA *</label>
                      <input required value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="RSSMRC85..." />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "#374151" }}>N° Licenza *</label>
                      <input required value={license} onChange={(e) => setLicense(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="FIAIP-A01" />
                    </div>
                  </div>
                </>
              )}

              {/* ── Campi comuni ─────────────────────────────────────────── */}
              {/* Paese + Città sulla stessa riga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: "#374151" }}>Paese *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    {...inputFocus}
                  >
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ color: "#374151" }}>Città</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    {...inputFocus}
                    placeholder="es. Firenze"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: "#374151" }}>
                  {role === "AGENCY" ? "Email agenzia *" : "Email *"}
                </label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="nome@esempio.com" />
              </div>

              <div>
                <label className={labelClass} style={{ color: "#374151" }}>
                  {role === "AGENCY" ? "Telefono agenzia *" : "Cellulare *"}
                </label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} style={inputStyle} {...inputFocus} placeholder="+39 333 1234567" />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass} style={{ color: "#374151" }}>Password *</label>
                <div className="relative">
                  <input required type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} style={inputStyle} {...inputFocus} placeholder="Min 8 caratteri, maiuscole e numeri" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#4b5563" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: "#374151" }}>Conferma password *</label>
                <div className="relative">
                  <input required type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass} pr-10`} style={inputStyle} {...inputFocus} placeholder="Ripeti la password" />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#4b5563" }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nota piano (solo Agency / Agent) */}
              {(role === "AGENCY" || role === "AGENT") && (
                <div className="rounded-lg border p-3" style={{ borderColor: "#D4D4D4", backgroundColor: "#f0fbf5" }}>
                  <p className="text-xs" style={{ color: "#374151", lineHeight: 1.6 }}>
                    <strong style={{ color: "#26A55B" }}>Piano gratuito per 14 giorni.</strong>{" "}
                    Dopo la registrazione potrai scegliere il tuo piano da{" "}
                    <Link href="/piani" target="_blank" style={{ color: "#26A55B", textDecoration: "underline" }}>
                      LandRetrieve.com Connect o Signature
                    </Link>{" "}
                    dalla sezione Abbonamento della dashboard.
                  </p>
                </div>
              )}

              {/* Privacy */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#26A55B]"
                />
                <span className="text-sm" style={{ color: "#374151" }}>
                  Accetto la{" "}
                  <Link href="/privacy-policy" target="_blank" className="hover:underline" style={{ color: "#26A55B" }}>
                    Privacy Policy
                  </Link>{" "}
                  e i Termini e Condizioni di LandRetrieve.com *
                </span>
              </label>

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
                className="flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#26A55B" }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {role === "VISITOR" ? "Crea account" : "Crea profilo e continua"}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs" style={{ color: "#4b5563" }}>
          © 2025 — SB.LAND — P.IVA IT 07385730481 | Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}
