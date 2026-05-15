"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────
type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER";

interface Offer {
  id: string;
  propertyId: string;
  offerPrice: number;
  currency: string;
  senderLocation: string | null;
  message: string | null;
  status: OfferStatus;
  createdAt: string;
  threadId: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  senderAvatar: string | null;
  sender?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatar: string | null;
    email: string;
  };
}

interface Deal {
  id: string;
  title: string;
  group: string | null;
  agentId: string | null;
  dealValue: number | null;
  status: string;
  createdAt: string;
  lead: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<OfferStatus, string> = {
  PENDING: "In attesa",
  ACCEPTED: "Accettata",
  REJECTED: "Rifiutata",
  COUNTER: "Controproposta",
};

const STATUS_COLOR: Record<OfferStatus, { bg: string; color: string }> = {
  PENDING: { bg: "#fef9c3", color: "#854d0e" },
  ACCEPTED: { bg: GREEN_LIGHT, color: GREEN_DARK },
  REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  COUNTER: { bg: "#ede9fe", color: "#5b21b6" },
};

function formatPrice(n: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Oggi";
  if (d === 1) return "Ieri";
  if (d < 7) return `${d} giorni fa`;
  return new Date(iso).toLocaleDateString("it-IT");
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OfferStatus }) {
  const { bg, color } = STATUS_COLOR[status] ?? STATUS_COLOR.PENDING;
  return (
    <span style={{ background: bg, color, fontSize: ".7rem", fontWeight: 700, padding: ".18rem .55rem", borderRadius: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Visitor view: my sent offers ──────────────────────────────────────────────
function VisitorOffers({ token }: { token: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento delle offerte.");
      const data = await res.json() as Offer[];
      setOffers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1.25rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: ".85rem" }}>
        {error}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.5rem", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>💰</div>
        <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .4rem" }}>Nessuna offerta inviata</p>
        <p style={{ fontSize: ".85rem", color: MUTED, margin: "0 0 1.25rem", lineHeight: 1.6 }}>
          Sfoglia gli immobili su LandRetrieve.com e invia la tua prima offerta.
        </p>
        <Link
          href="/cerca"
          style={{ display: "inline-block", padding: ".6rem 1.4rem", background: GREEN, color: "#fff", borderRadius: 7, fontWeight: 600, fontSize: ".88rem", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          Sfoglia immobili
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
      {offers.map((offer) => (
        <div
          key={offer.id}
          style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}
        >
          {/* Icon */}
          <div style={{ width: 44, height: 44, borderRadius: 10, background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.3rem" }}>
            🏡
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", flexWrap: "wrap", marginBottom: ".35rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: TEXT, fontSize: ".88rem" }}>
                  Immobile #{offer.propertyId.slice(-6).toUpperCase()}
                </div>
                <div style={{ fontSize: ".75rem", color: MUTED }}>{relativeDate(offer.createdAt)}</div>
              </div>
              <StatusBadge status={offer.status as OfferStatus} />
            </div>

            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: GREEN, marginBottom: ".3rem" }}>
              {formatPrice(offer.offerPrice, offer.currency)}
            </div>

            {offer.message && (
              <p style={{ fontSize: ".8rem", color: TEXT_SOFT, margin: "0 0 .5rem", lineHeight: 1.55, fontStyle: "italic" }}>
                &ldquo;{offer.message}&rdquo;
              </p>
            )}

            {offer.threadId && (
              <Link
                href="/dashboard/messaggi"
                style={{ fontSize: ".78rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}
              >
                → Vedi conversazione in Messaggi
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Professional: received offers ─────────────────────────────────────────────
function ReceivedOffers({ token }: { token: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento delle offerte.");
      setOffers(await res.json() as Offer[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  async function updateStatus(offerId: string, status: OfferStatus) {
    setUpdating(offerId);
    try {
      const res = await fetch(`${API_URL}/api/offers/${offerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Errore nell'aggiornamento.");
      setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status } : o));
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: "1.25rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: ".85rem" }}>{error}</div>;
  }

  if (offers.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.5rem", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>📬</div>
        <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .4rem" }}>Nessuna offerta ricevuta</p>
        <p style={{ fontSize: ".85rem", color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Le offerte arriveranno quando un visitatore farà clic su &ldquo;Fai la tua offerta&rdquo; su uno dei tuoi annunci.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
      {offers.map((offer) => {
        const sender = offer.sender;
        const senderName = (sender?.displayName ?? `${sender?.firstName ?? ""} ${sender?.lastName ?? ""}`.trim()) || offer.senderName;
        const isUpdating = updating === offer.id;

        return (
          <div key={offer.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {offer.senderAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={offer.senderAvatar} alt={senderName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.1rem" }}>{senderName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: TEXT, fontSize: ".88rem" }}>{senderName}</div>
                    <div style={{ fontSize: ".75rem", color: MUTED }}>{offer.senderEmail}{offer.senderPhone ? ` · ${offer.senderPhone}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <span style={{ fontSize: ".72rem", color: MUTED }}>{relativeDate(offer.createdAt)}</span>
                    <StatusBadge status={offer.status as OfferStatus} />
                  </div>
                </div>

                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: GREEN, margin: ".5rem 0 .25rem" }}>
                  {formatPrice(offer.offerPrice, offer.currency)}
                </div>

                {offer.senderLocation && (
                  <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".3rem" }}>📍 {offer.senderLocation}</div>
                )}

                {offer.message && (
                  <p style={{ fontSize: ".8rem", color: TEXT_SOFT, margin: ".4rem 0 .6rem", lineHeight: 1.55, fontStyle: "italic", padding: ".6rem .75rem", background: "#f9f9f9", borderRadius: 6, borderLeft: `3px solid ${BORDER}` }}>
                    &ldquo;{offer.message}&rdquo;
                  </p>
                )}

                {/* Actions */}
                {offer.status === "PENDING" && (
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".65rem" }}>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(offer.id, "ACCEPTED")}
                      style={{ padding: ".4rem .9rem", background: GREEN, color: "#fff", border: "none", borderRadius: 6, fontSize: ".78rem", fontWeight: 600, cursor: isUpdating ? "not-allowed" : "pointer" }}
                      onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = GREEN_DARK; }}
                      onMouseLeave={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = GREEN; }}
                    >
                      ✓ Accetta
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(offer.id, "COUNTER")}
                      style={{ padding: ".4rem .9rem", background: "#ede9fe", color: "#5b21b6", border: "none", borderRadius: 6, fontSize: ".78rem", fontWeight: 600, cursor: isUpdating ? "not-allowed" : "pointer" }}
                      onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#ddd6fe"; }}
                      onMouseLeave={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#ede9fe"; }}
                    >
                      ↕ Controproposta
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(offer.id, "REJECTED")}
                      style={{ padding: ".4rem .9rem", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontSize: ".78rem", fontWeight: 600, cursor: isUpdating ? "not-allowed" : "pointer" }}
                      onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#fecaca"; }}
                      onMouseLeave={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                    >
                      ✕ Rifiuta
                    </button>
                    {offer.threadId && (
                      <Link
                        href="/dashboard/messaggi"
                        style={{ padding: ".4rem .9rem", background: "#f5f5f5", color: TEXT_SOFT, borderRadius: 6, fontSize: ".78rem", fontWeight: 600, textDecoration: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ebebeb"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
                      >
                        💬 Rispondi
                      </Link>
                    )}
                  </div>
                )}

                {offer.status !== "PENDING" && offer.threadId && (
                  <Link
                    href="/dashboard/messaggi"
                    style={{ display: "inline-block", marginTop: ".5rem", fontSize: ".78rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}
                  >
                    → Apri conversazione
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Professional: deals (accordi) ────────────────────────────────────────────
interface DealForm {
  title: string;
  group: string;
  contactName: string;
  agentId: string;
  dealValue: string;
}

function DealsTab({ token }: { token: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DealForm>({ title: "", group: "", contactName: "", agentId: "", dealValue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/offers/deals`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setDeals(await res.json() as Deal[]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  function inputStyle(field: string): React.CSSProperties {
    return {
      width: "100%",
      padding: ".5rem .7rem",
      border: `1.5px solid ${focused === field ? GREEN : BORDER}`,
      borderRadius: 7,
      fontSize: ".85rem",
      color: TEXT,
      background: "#fff",
      outline: "none",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "border-color .2s",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.contactName.trim()) {
      setFormError("Titolo e Nome Contatto sono obbligatori.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`${API_URL}/api/offers/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          group: form.group || undefined,
          contactName: form.contactName,
          agentId: form.agentId || undefined,
          dealValue: form.dealValue ? Number(form.dealValue) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Errore nella creazione dell'accordo.");
      const deal = await res.json() as Deal;
      setDeals((prev) => [deal, ...prev]);
      setForm({ title: "", group: "", contactName: "", agentId: "", dealValue: "" });
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Errore.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header with add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: ".85rem", color: MUTED }}>
          {deals.length} accordo{deals.length !== 1 ? "i" : ""} registrat{deals.length !== 1 ? "i" : "o"}
        </span>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ padding: ".45rem .9rem", background: GREEN, color: "#fff", border: "none", borderRadius: 7, fontSize: ".82rem", fontWeight: 600, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          {showForm ? "✕ Annulla" : "+ Nuovo accordo"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontWeight: 700, fontSize: ".9rem", color: TEXT, marginBottom: "1rem" }}>Nuovo accordo</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".6rem" }}>
            <div>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Titolo*</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused(null)}
                placeholder="es. Vendita casale Montalcino"
                style={inputStyle("title")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Gruppo</label>
              <input
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                onFocus={() => setFocused("group")}
                onBlur={() => setFocused(null)}
                placeholder="es. Q1 2025"
                style={inputStyle("group")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Nome Contatto*</label>
              <input
                value={form.contactName}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                onFocus={() => setFocused("contactName")}
                onBlur={() => setFocused(null)}
                placeholder="es. Mario Rossi"
                style={inputStyle("contactName")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Agente</label>
              <input
                value={form.agentId}
                onChange={(e) => setForm((f) => ({ ...f, agentId: e.target.value }))}
                onFocus={() => setFocused("agentId")}
                onBlur={() => setFocused(null)}
                placeholder="ID agente (opzionale)"
                style={inputStyle("agentId")}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>Valore (€, IVA inclusa)</label>
              <input
                type="number"
                min={0}
                value={form.dealValue}
                onChange={(e) => setForm((f) => ({ ...f, dealValue: e.target.value }))}
                onFocus={() => setFocused("dealValue")}
                onBlur={() => setFocused(null)}
                placeholder="es. 750000"
                style={inputStyle("dealValue")}
              />
            </div>
          </div>

          {formError && (
            <div style={{ padding: ".5rem .75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: ".78rem", color: "#dc2626", marginBottom: ".75rem" }}>
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ padding: ".55rem 1.2rem", background: submitting ? "#9ca3af" : GREEN, color: "#fff", border: "none", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = GREEN_DARK; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = submitting ? "#9ca3af" : GREEN; }}
          >
            {submitting ? "Salvataggio..." : "Salva accordo"}
          </button>
        </form>
      )}

      {/* Deals list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🤝</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .35rem" }}>Nessun accordo registrato</p>
          <p style={{ fontSize: ".82rem", color: MUTED, margin: 0, lineHeight: 1.6 }}>Aggiungi manualmente le trattative concluse o in corso.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
          {deals.map((deal) => (
            <div key={deal.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, color: TEXT, fontSize: ".9rem", marginBottom: ".2rem" }}>{deal.title}</div>
                <div style={{ fontSize: ".78rem", color: MUTED }}>
                  {deal.lead.firstName} {deal.lead.lastName ?? ""}
                  {deal.group ? ` · ${deal.group}` : ""}
                </div>
                <div style={{ fontSize: ".72rem", color: "#9ca3af", marginTop: ".2rem" }}>{relativeDate(deal.createdAt)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {deal.dealValue != null && (
                  <div style={{ fontWeight: 700, color: GREEN, fontSize: "1rem" }}>
                    {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(deal.dealValue)}
                  </div>
                )}
                <span style={{
                  display: "inline-block", marginTop: ".2rem",
                  background: deal.status === "open" ? GREEN_LIGHT : "#f5f5f5",
                  color: deal.status === "open" ? GREEN_DARK : MUTED,
                  fontSize: ".68rem", fontWeight: 700, padding: ".15rem .45rem", borderRadius: 4,
                  letterSpacing: ".06em", textTransform: "uppercase",
                }}>
                  {deal.status === "open" ? "Aperto" : deal.status === "closed" ? "Chiuso" : deal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OffertePage() {
  const { data: session, status } = useSession();
  const user = session?.user as {
    id?: string; role?: string; accessToken?: string;
  } | undefined;

  const role = user?.role ?? "VISITOR";
  const isProfessional = role === "AGENCY" || role === "AGENT";
  const token = user?.accessToken ?? "";

  const [activeTab, setActiveTab] = useState<"ricevute" | "accordi">("ricevute");

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  // ── Visitor layout ─────────────────────────────────────────────────────────
  if (!isProfessional) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Le mie offerte</h1>
        {status === "unauthenticated" ? (
          <div style={{ padding: "2rem", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, textAlign: "center" }}>
            <p style={{ color: MUTED, marginBottom: "1rem" }}>Accedi per vedere le tue offerte.</p>
            <Link href="/login" style={{ padding: ".6rem 1.4rem", background: GREEN, color: "#fff", borderRadius: 7, fontWeight: 600, textDecoration: "none", fontSize: ".88rem" }}>
              Accedi
            </Link>
          </div>
        ) : (
          <VisitorOffers token={token} />
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Professional layout (tabs) ─────────────────────────────────────────────
  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Offerte & Accordi</h1>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `2px solid ${BORDER}`, marginBottom: "1.25rem", gap: "0" }}>
        {(["ricevute", "accordi"] as const).map((tab) => {
          const labels = { ricevute: "Offerte ricevute", accordi: "Accordi" };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: ".65rem 1.25rem",
                border: "none",
                borderBottom: `2px solid ${isActive ? GREEN : "transparent"}`,
                marginBottom: -2,
                background: "transparent",
                fontWeight: isActive ? 700 : 500,
                fontSize: ".88rem",
                color: isActive ? GREEN : MUTED,
                cursor: "pointer",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = TEXT; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = MUTED; }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "ricevute" && <ReceivedOffers token={token} />}
      {activeTab === "accordi" && <DealsTab token={token} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
