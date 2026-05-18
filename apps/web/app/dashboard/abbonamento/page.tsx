"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// ── Design tokens ──────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Subscription {
  id: string;
  plan: string;
  status: string;
  billingCycle: string;
  basePrice: number;
  totalPrice: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  agentBadges: { id: string; agentId: string; price: number }[];
  featuredListings: { id: string; propertyId: string; price: number }[];
  invoices: { id: string; amount: number; currency: string; status: string; paidAt: string | null; pdfUrl: string | null }[];
}

interface Agent {
  id: string;
  user: { id: string; displayName: string | null; email: string };
}

interface Property {
  id: string;
  title: string;
  slug: string;
  status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function planLabel(plan: string) {
  if (plan === "CONNECT") return "Connect";
  if (plan === "SIGNATURE") return "Signature";
  if (plan === "ENTERPRISE") return "Enterprise";
  return plan;
}

function statusColor(status: string): { bg: string; color: string } {
  if (status === "ACTIVE") return { bg: "#dcfce7", color: "#15803d" };
  if (status === "TRIALING") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (status === "CANCELLED") return { bg: "#fee2e2", color: "#991b1b" };
  return { bg: "#f5f5f5", color: MUTED };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 1rem", borderBottom: `1px solid ${BORDER}`, paddingBottom: ".5rem" }}>
      {children}
    </h2>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AbbonamentoPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProp, setSelectedProp] = useState("");
  const [addingBadge, setAddingBadge] = useState(false);
  const [addingIPP, setAddingIPP] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [subRes, agentsRes, propsRes] = await Promise.all([
        fetch(`${API_URL}/api/payments/subscription`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }),
        fetch(`${API_URL}/api/payments/my-agents`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }),
        fetch(`${API_URL}/api/payments/my-properties`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }),
      ]);
      if (subRes.ok) setSub(await subRes.json() as Subscription);
      if (agentsRes.ok) setAgents(await agentsRes.json() as Agent[]);
      if (propsRes.ok) setProperties(await propsRes.json() as Property[]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function startCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ plan: "CONNECT", billingCycle: selectedPlan }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payments/portal`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  async function addBadge() {
    if (!selectedAgent) return;
    setAddingBadge(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/payments/badge-addon`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ agentId: selectedAgent }),
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Badge aggiunto con successo." });
        setSelectedAgent("");
        await fetchAll();
      } else {
        const err = await res.json() as { message?: string };
        setFeedback({ type: "err", msg: err.message ?? "Errore durante l'aggiunta del badge." });
      }
    } finally {
      setAddingBadge(false);
    }
  }

  async function addIPP() {
    if (!selectedProp) return;
    setAddingIPP(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/payments/ipp-addon`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ propertyId: selectedProp }),
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Immobile In Primo Piano attivato." });
        setSelectedProp("");
        await fetchAll();
      } else {
        const err = await res.json() as { message?: string };
        setFeedback({ type: "err", msg: err.message ?? "Errore durante l'attivazione." });
      }
    } finally {
      setAddingIPP(false);
    }
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  const btnPrimary: React.CSSProperties = {
    padding: ".5rem 1.1rem", background: GREEN, color: "#fff", border: "none",
    borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
  };

  const btnOutline: React.CSSProperties = {
    padding: ".5rem 1.1rem", background: "#fff", color: TEXT_SOFT,
    border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
  };

  if (role && role !== "AGENT" && role !== "AGENCY") {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600, color: TEXT }}>403 — Non autorizzato</p>
        <p style={{ fontSize: ".85rem", color: MUTED, marginTop: ".5rem" }}>
          Questa sezione è riservata ad agenti e agenzie.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const hasActiveSub = sub && (sub.status === "ACTIVE" || sub.status === "TRIALING");
  const availableProps = properties.filter((p) =>
    !sub?.featuredListings.some((fl) => fl.propertyId === p.id),
  );
  const badgedAgentIds = new Set((sub?.agentBadges ?? []).map((b) => b.agentId));
  const availableAgents = agents.filter((a) => !badgedAgentIds.has(a.id));

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.5rem" }}>Abbonamento</h1>

      {feedback && (
        <div style={{
          padding: ".75rem 1rem", borderRadius: 8, marginBottom: "1rem",
          background: feedback.type === "ok" ? "#dcfce7" : "#fee2e2",
          color: feedback.type === "ok" ? "#15803d" : "#991b1b",
          fontSize: ".83rem", fontWeight: 500,
        }}>
          {feedback.msg}
        </div>
      )}

      {/* ── Current plan ──────────────────────────────────────────────────── */}
      {hasActiveSub ? (
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionTitle>Piano attivo</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "1.15rem", fontWeight: 700, color: TEXT }}>{planLabel(sub.plan)}</span>
              <span style={{ marginLeft: ".5rem", fontSize: ".75rem", color: MUTED }}>
                {sub.billingCycle === "YEARLY" ? "annuale" : "mensile"}
              </span>
            </div>
            {(() => {
              const sc = statusColor(sub.status);
              return (
                <span style={{ background: sc.bg, color: sc.color, fontSize: ".72rem", fontWeight: 700, padding: ".2rem .55rem", borderRadius: 4, textTransform: "uppercase" }}>
                  {sub.status === "ACTIVE" ? "Attivo" : sub.status === "TRIALING" ? "Prova" : sub.status}
                </span>
              );
            })()}
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT }}>{formatEur(Number(sub.totalPrice))}<span style={{ fontSize: ".75rem", fontWeight: 400, color: MUTED }}>/mese</span></div>
              {sub.currentPeriodEnd && (
                <div style={{ fontSize: ".72rem", color: MUTED }}>
                  {sub.cancelAtPeriodEnd ? "Annulla il " : "Rinnova il "}{formatDate(sub.currentPeriodEnd)}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem" }}>
            <button onClick={openPortal} disabled={portalLoading} style={btnOutline}>
              {portalLoading ? "…" : "Gestisci fatturazione"}
            </button>
          </div>
        </Card>
      ) : (
        /* ── No subscription — pricing cards ─────────────────────────────── */
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionTitle>Scegli il tuo piano</SectionTitle>

          {/* Billing toggle */}
          <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.25rem", alignItems: "center" }}>
            <button
              onClick={() => setSelectedPlan("MONTHLY")}
              style={{ ...btnOutline, ...(selectedPlan === "MONTHLY" ? { borderColor: GREEN, color: GREEN, fontWeight: 700 } : {}) }}
            >
              Mensile
            </button>
            <button
              onClick={() => setSelectedPlan("YEARLY")}
              style={{ ...btnOutline, ...(selectedPlan === "YEARLY" ? { borderColor: GREEN, color: GREEN, fontWeight: 700 } : {}) }}
            >
              Annuale <span style={{ fontSize: ".7rem", color: GREEN, marginLeft: ".25rem" }}>-10%</span>
            </button>
          </div>

          {/* Plan card */}
          <div style={{ border: `2px solid ${GREEN}`, borderRadius: 10, padding: "1.25rem", maxWidth: 340 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: ".25rem" }}>Connect</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT }}>
              {selectedPlan === "YEARLY" ? "€26,91" : "€29,90"}
              <span style={{ fontSize: ".85rem", fontWeight: 400, color: MUTED }}>/mese</span>
            </div>
            {selectedPlan === "YEARLY" && (
              <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".5rem" }}>Fatturato annualmente: €322,92</div>
            )}
            <ul style={{ fontSize: ".82rem", color: TEXT_SOFT, margin: ".75rem 0", paddingLeft: "1.1rem", lineHeight: 1.7 }}>
              <li>Annunci illimitati</li>
              <li>Badge verificato add-on €4,90/mese</li>
              <li>Immobili In Primo Piano €7,90/cad.</li>
              <li>Dashboard CRM completa</li>
            </ul>
            <button
              onClick={startCheckout}
              disabled={checkoutLoading}
              style={{ ...btnPrimary, width: "100%", marginTop: ".5rem" }}
            >
              {checkoutLoading ? "…" : "Abbonati ora"}
            </button>
          </div>
        </Card>
      )}

      {/* ── Agency: Badge agenti ──────────────────────────────────────────── */}
      {role === "AGENCY" && hasActiveSub && (
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionTitle>Conferisci Badge agli Agenti <span style={{ fontSize: ".75rem", color: MUTED, fontWeight: 400 }}>€4,90/agente/mese</span></SectionTitle>

          {/* Active badges */}
          {(sub?.agentBadges ?? []).length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              {sub!.agentBadges.map((b) => {
                const agent = agents.find((a) => a.id === b.agentId);
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".4rem 0", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "1rem" }}>✓</span>
                    <span style={{ fontSize: ".83rem", color: TEXT, fontWeight: 500 }}>
                      {agent ? (agent.user.displayName ?? agent.user.email) : b.agentId}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: ".75rem", color: MUTED }}>{formatEur(Number(b.price))}/mese</span>
                  </div>
                );
              })}
            </div>
          )}

          {availableAgents.length > 0 ? (
            <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} style={{ ...inputBase, flex: 1, minWidth: 200 }}>
                <option value="">Seleziona agente…</option>
                {availableAgents.map((a) => (
                  <option key={a.id} value={a.id}>{a.user.displayName ?? a.user.email}</option>
                ))}
              </select>
              <button onClick={addBadge} disabled={!selectedAgent || addingBadge} style={{ ...btnPrimary, opacity: !selectedAgent || addingBadge ? 0.6 : 1 }}>
                {addingBadge ? "…" : "Aggiungi badge"}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: ".82rem", color: MUTED, margin: 0 }}>
              {agents.length === 0 ? "Nessun agente nel tuo team." : "Tutti gli agenti hanno già il badge."}
            </p>
          )}
        </Card>
      )}

      {/* ── IPP section (Agency + Agent) ──────────────────────────────────── */}
      {hasActiveSub && (
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionTitle>Immobili In Primo Piano (IPP) <span style={{ fontSize: ".75rem", color: MUTED, fontWeight: 400 }}>€7,90/immobile/mese</span></SectionTitle>

          {(sub?.featuredListings ?? []).length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              {sub!.featuredListings.map((fl) => {
                const prop = properties.find((p) => p.id === fl.propertyId);
                return (
                  <div key={fl.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".4rem 0", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "1rem" }}>⭐</span>
                    <span style={{ fontSize: ".83rem", color: TEXT, fontWeight: 500, flex: 1 }}>
                      {prop ? prop.title : fl.propertyId}
                    </span>
                    <span style={{ fontSize: ".75rem", color: MUTED }}>{formatEur(Number(fl.price))}/mese</span>
                  </div>
                );
              })}
            </div>
          )}

          {availableProps.length > 0 ? (
            <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
              <select value={selectedProp} onChange={(e) => setSelectedProp(e.target.value)} style={{ ...inputBase, flex: 1, minWidth: 220 }}>
                <option value="">Seleziona immobile…</option>
                {availableProps.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <button onClick={addIPP} disabled={!selectedProp || addingIPP} style={{ ...btnPrimary, opacity: !selectedProp || addingIPP ? 0.6 : 1 }}>
                {addingIPP ? "…" : "Attiva IPP"}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: ".82rem", color: MUTED, margin: 0 }}>
              {properties.length === 0 ? "Nessun immobile disponibile." : "Tutti gli immobili sono già In Primo Piano."}
            </p>
          )}

          <p style={{ fontSize: ".72rem", color: MUTED, margin: ".75rem 0 0" }}>
            L&apos;addebito si ferma automaticamente quando l&apos;immobile viene segnato come venduto.
          </p>
        </Card>
      )}

      {/* ── Invoices ──────────────────────────────────────────────────────── */}
      {(sub?.invoices ?? []).length > 0 && (
        <Card>
          <SectionTitle>Fatture</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Data", "Importo", "Stato", ""].map((h) => (
                  <th key={h} style={{ padding: ".5rem .75rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sub!.invoices.map((inv, i) => (
                <tr key={inv.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : "none" }}>
                  <td style={{ padding: ".55rem .75rem", fontSize: ".82rem", color: TEXT_SOFT }}>
                    {inv.paidAt ? formatDate(inv.paidAt) : "—"}
                  </td>
                  <td style={{ padding: ".55rem .75rem", fontSize: ".82rem", fontWeight: 600, color: TEXT }}>
                    {formatEur(Number(inv.amount))}
                  </td>
                  <td style={{ padding: ".55rem .75rem" }}>
                    <span style={{
                      fontSize: ".7rem", fontWeight: 700, padding: ".15rem .45rem", borderRadius: 4, textTransform: "uppercase",
                      background: inv.status === "paid" ? "#dcfce7" : "#fee2e2",
                      color: inv.status === "paid" ? "#15803d" : "#991b1b",
                    }}>
                      {inv.status === "paid" ? "Pagata" : "Fallita"}
                    </span>
                  </td>
                  <td style={{ padding: ".55rem .75rem", textAlign: "right" }}>
                    {inv.pdfUrl && (
                      <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: ".75rem", color: GREEN, textDecoration: "none" }}>
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
