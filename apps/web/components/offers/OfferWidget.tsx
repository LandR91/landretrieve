"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ── Design tokens (Sezione 3) ─────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const GREEN_XLIGHT = "#f0fbf5";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface OfferWidgetProps {
  propertyId: string;
  receiverId: string;
  currency?: string;
  listingType: "SALE" | "RENT";
}

function inputStyle(focused: boolean, error?: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: ".55rem .75rem",
    border: `1.5px solid ${error ? "#dc2626" : focused ? GREEN : BORDER}`,
    borderRadius: 8,
    fontSize: ".88rem",
    color: TEXT,
    background: "#fff",
    outline: "none",
    transition: "border-color .2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
}

export function OfferWidget({ propertyId, receiverId, currency = "EUR", listingType }: OfferWidgetProps) {
  const { data: session, status } = useSession();
  const user = session?.user as {
    id?: string; firstName?: string; lastName?: string; displayName?: string;
    email?: string; phone?: string; avatar?: string; accessToken?: string;
  } | undefined;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    senderLocation: "",
    offerPrice: "",
    message: "",
    privacy: false,
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Gate: only on SALE listings ───────────────────────────────────────────
  if (listingType !== "SALE") return null;

  // ── Gate: must be logged in ───────────────────────────────────────────────
  if (status === "unauthenticated") {
    return (
      <div style={{ background: GREEN_XLIGHT, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>💰</div>
        <p style={{ fontSize: ".88rem", color: TEXT_SOFT, margin: "0 0 .85rem", lineHeight: 1.55 }}>
          Accedi per inviare un&apos;offerta su questo immobile.
        </p>
        <Link
          href="/login"
          style={{ display: "block", padding: ".65rem", background: GREEN, color: "#fff", borderRadius: 7, fontWeight: 600, fontSize: ".9rem", textDecoration: "none", transition: "background-color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          Accedi
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div style={{ background: "#f5f5f5", borderRadius: 10, padding: "1.25rem", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  // ── Gate: must have avatar ────────────────────────────────────────────────
  if (!user?.avatar) {
    return (
      <div style={{ background: GREEN_XLIGHT, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "1.25rem" }}>
        <div style={{ fontSize: "1.3rem", marginBottom: ".5rem" }}>💰</div>
        <p style={{ fontSize: ".85rem", color: TEXT_SOFT, margin: "0 0 .85rem", lineHeight: 1.55 }}>
          Per inviare un&apos;offerta devi prima caricare una <strong>foto profilo</strong>.
        </p>
        <Link
          href="/dashboard/profilo"
          style={{ display: "block", padding: ".6rem", background: GREEN, color: "#fff", borderRadius: 7, fontWeight: 600, fontSize: ".85rem", textDecoration: "none", textAlign: "center", transition: "background-color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          Carica foto profilo
        </Link>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ background: GREEN_XLIGHT, border: `1px solid ${GREEN}40`, borderRadius: 10, padding: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: ".6rem" }}>✅</div>
        <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .35rem" }}>Offerta inviata!</p>
        <p style={{ fontSize: ".82rem", color: TEXT_SOFT, margin: "0 0 .85rem", lineHeight: 1.55 }}>
          Il professionista ha ricevuto la tua offerta. Trovi la conversazione in{" "}
          <Link href="/dashboard/messaggi" style={{ color: GREEN, textDecoration: "none", fontWeight: 600 }}>Messaggi</Link>.
        </p>
        <button
          onClick={() => { setSuccess(false); setOpen(false); setForm({ senderLocation: "", offerPrice: "", message: "", privacy: false }); }}
          style={{ fontSize: ".8rem", color: "#5a5a5a", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Invia un&apos;altra offerta
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  function update(key: string, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    setApiError(null);
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.senderLocation.trim()) e.senderLocation = "Campo obbligatorio";
    if (!form.offerPrice || isNaN(Number(form.offerPrice)) || Number(form.offerPrice) <= 0)
      e.offerPrice = "Inserisci un'offerta valida";
    if (!form.privacy) e.privacy = "Accetta la privacy policy per continuare";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken ?? ""}`,
        },
        credentials: "include",
        body: JSON.stringify({
          propertyId,
          receiverId,
          offerPrice: Number(form.offerPrice),
          currency,
          senderLocation: form.senderLocation,
          message: form.message || undefined,
          privacyAccepted: form.privacy,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? "Errore durante l'invio dell'offerta.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Errore durante l'invio.");
    } finally {
      setLoading(false);
    }
  }

  const displayName = user.displayName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
      {/* Trigger */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%", padding: "1rem",
            background: GREEN, color: "#fff",
            border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: ".95rem",
            cursor: "pointer", transition: "background-color .2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          💰 Fai la tua offerta
        </button>
      ) : (
        <div style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>💰 La tua offerta</span>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#5a5a5a", fontSize: "1.1rem", lineHeight: 1 }}>×</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Pre-filled nome/cognome/email/tel (read-only from session) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".6rem" }}>
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Nome*</label>
                <input readOnly value={user.firstName ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Cognome*</label>
                <input readOnly value={user.lastName ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
            </div>

            {/* Da dove scrivi */}
            <div style={{ marginBottom: ".6rem" }}>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Da dove scrivi*</label>
              <input
                type="text"
                placeholder="es. Milano, Italia"
                value={form.senderLocation}
                onChange={(e) => update("senderLocation", e.target.value)}
                onFocus={() => setFocused("senderLocation")}
                onBlur={() => setFocused(null)}
                style={inputStyle(focused === "senderLocation", !!errors.senderLocation)}
              />
              {errors.senderLocation && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{errors.senderLocation}</p>}
            </div>

            {/* Email/Tel read-only */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".6rem" }}>
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Email*</label>
                <input readOnly value={user.email ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a", fontSize: ".78rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Telefono*</label>
                <input readOnly value={user.phone ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
            </div>

            {/* Avatar preview */}
            {user.avatar && (
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".75rem", padding: ".5rem .65rem", background: "#f5f5f5", borderRadius: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt={displayName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontSize: ".78rem", color: TEXT_SOFT }}>{displayName}</span>
                <span style={{ marginLeft: "auto", fontSize: ".68rem", color: GREEN, fontWeight: 600 }}>✓ foto</span>
              </div>
            )}

            {/* Offer price */}
            <div style={{ marginBottom: ".6rem" }}>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>
                La tua offerta* ({currency})
              </label>
              <input
                type="number"
                min={0}
                placeholder="es. 450000"
                value={form.offerPrice}
                onChange={(e) => update("offerPrice", e.target.value)}
                onFocus={() => setFocused("offerPrice")}
                onBlur={() => setFocused(null)}
                style={inputStyle(focused === "offerPrice", !!errors.offerPrice)}
              />
              {errors.offerPrice && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{errors.offerPrice}</p>}
            </div>

            {/* Message */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#5a5a5a", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Messaggio</label>
              <textarea
                rows={3}
                placeholder="Aggiungi un messaggio (facoltativo)..."
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused(null)}
                style={{ ...inputStyle(focused === "message"), resize: "vertical" }}
              />
            </div>

            {/* Privacy */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: ".5rem", cursor: "pointer", fontSize: ".8rem", color: TEXT_SOFT, lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={form.privacy}
                  onChange={(e) => update("privacy", e.target.checked)}
                  style={{ accentColor: GREEN, width: 15, height: 15, cursor: "pointer", marginTop: ".15rem", flexShrink: 0 }}
                />
                <span>
                  Accetto la{" "}
                  <Link href="/privacy-policy" style={{ color: GREEN, textDecoration: "none" }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.privacy && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{errors.privacy}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <div style={{ padding: ".6rem .75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: ".78rem", color: "#dc2626", marginBottom: ".75rem" }}>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: ".75rem",
                background: loading ? "#9ca3af" : GREEN,
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: ".9rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color .2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GREEN_DARK; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GREEN; }}
            >
              {loading ? "Invio in corso..." : "Invia offerta"}
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
