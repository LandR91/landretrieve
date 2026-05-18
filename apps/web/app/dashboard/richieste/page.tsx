"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CrmEnquiry {
  id: string;
  message: string | null;
  status: string | null;
  enquiryType: string | null;
  createdAt: string;
  lead: { id: string; firstName: string | null; lastName: string | null; email: string; mobile: string | null } | null;
  property: { id: string; title: string; slug: string } | null;
}

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["new", "contacted", "closed"];
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  new:       { bg: "#fef9c3", color: "#854d0e", label: "Nuova" },
  contacted: { bg: "#dbeafe", color: "#1d4ed8", label: "Contattato" },
  closed:    { bg: "#f5f5f5", color: MUTED, label: "Chiusa" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Oggi";
  if (d === 1) return "Ieri";
  if (d < 7) return `${d}gg fa`;
  return new Date(iso).toLocaleDateString("it-IT");
}

function contactName(lead: CrmEnquiry["lead"]) {
  if (!lead) return "—";
  return `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || lead.email;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RichiestePage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [enquiries, setEnquiries] = useState<CrmEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("Azioni in blocco");
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/crm/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setEnquiries(await res.json() as CrmEnquiry[]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await fetch(`${API_URL}/api/crm/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    } finally {
      setUpdatingId(null);
    }
  }

  async function applyBulkAction() {
    if (bulkAction !== "Cancella" || selected.size === 0) return;
    const ids = Array.from(selected);
    await fetch(`${API_URL}/api/crm/enquiries`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });
    setEnquiries((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    setBulkAction("Azioni in blocco");
  }

  async function deleteEnquiry(id: string) {
    await fetch(`${API_URL}/api/crm/enquiries`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ids: [id] }),
    });
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  const filtered = enquiries.filter((e) => !filterStatus || e.status === filterStatus);

  const allSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); filtered.forEach((e) => s.delete(e.id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); filtered.forEach((e) => s.add(e.id)); return s; });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Richieste</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginBottom: ".85rem" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputBase }}>
          <option value="">Tutti gli stati</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_STYLE[s]?.label ?? s}</option>)}
        </select>

        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginLeft: "auto" }}>
            <span style={{ fontSize: ".78rem", color: MUTED }}>{selected.size} selezionate</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} style={{ ...inputBase }}>
              <option>Azioni in blocco</option>
              <option value="Cancella">Cancella</option>
            </select>
            <button
              onClick={applyBulkAction}
              disabled={bulkAction === "Azioni in blocco"}
              style={{
                padding: ".4rem .85rem",
                background: bulkAction === "Cancella" ? "#fee2e2" : "#f5f5f5",
                color: bulkAction === "Cancella" ? "#991b1b" : MUTED,
                border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: ".82rem", fontWeight: 600,
                cursor: bulkAction === "Azioni in blocco" ? "not-allowed" : "pointer",
              }}
            >
              Applica
            </button>
          </div>
        )}

        <div style={{ marginLeft: selected.size > 0 ? "0" : "auto", fontSize: ".78rem", color: MUTED }}>
          {filtered.length} richiest{filtered.length !== 1 ? "e" : "a"}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>📋</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .3rem" }}>Nessuna richiesta</p>
          <p style={{ fontSize: ".83rem", color: MUTED, margin: 0 }}>Le richieste arrivano quando un utente compila il form di contatto su un annuncio.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ width: 40, padding: ".75rem .85rem" }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: GREEN, cursor: "pointer" }} />
                </th>
                {["Data", "Contatto", "Annuncio", "Messaggio", "Tipo", "Stato", ""].map((h) => (
                  <th key={h} style={{ padding: ".75rem .85rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq, i) => (
                <tr
                  key={eq.id}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none", background: selected.has(eq.id) ? "#f0fbf5" : "transparent" }}
                >
                  <td style={{ padding: ".65rem .85rem" }}>
                    <input type="checkbox" checked={selected.has(eq.id)} onChange={() => toggleOne(eq.id)} style={{ accentColor: GREEN, cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: ".65rem .85rem", fontSize: ".78rem", color: MUTED, whiteSpace: "nowrap" }}>{relativeDate(eq.createdAt)}</td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <div style={{ fontWeight: 600, fontSize: ".85rem", color: TEXT }}>{contactName(eq.lead)}</div>
                    {eq.lead?.mobile && <div style={{ fontSize: ".72rem", color: MUTED }}>{eq.lead.mobile}</div>}
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    {eq.property ? (
                      <Link href={`/immobili/${eq.property.slug}`} style={{ fontSize: ".82rem", color: GREEN, textDecoration: "none", fontWeight: 500 }}>
                        {eq.property.title.length > 30 ? eq.property.title.slice(0, 30) + "…" : eq.property.title}
                      </Link>
                    ) : <span style={{ color: MUTED, fontSize: ".82rem" }}>—</span>}
                  </td>
                  <td style={{ padding: ".65rem .85rem", maxWidth: 200 }}>
                    <p style={{ fontSize: ".78rem", color: TEXT_SOFT, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {eq.message ?? "—"}
                    </p>
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    {eq.enquiryType ? (
                      <span style={{ fontSize: ".7rem", fontWeight: 600, background: "#f5f5f5", color: MUTED, padding: ".15rem .4rem", borderRadius: 3 }}>{eq.enquiryType}</span>
                    ) : <span style={{ color: MUTED, fontSize: ".78rem" }}>—</span>}
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <select
                      value={eq.status ?? "new"}
                      disabled={updatingId === eq.id}
                      onChange={(e) => updateStatus(eq.id, e.target.value)}
                      style={{ ...inputBase, padding: ".25rem .45rem", fontSize: ".75rem", cursor: "pointer" }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_STYLE[s]?.label ?? s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <button
                      onClick={() => deleteEnquiry(eq.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1rem", padding: ".2rem .4rem" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      title="Elimina"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Note about status */}
      {enquiries.length > 0 && (
        <p style={{ fontSize: ".72rem", color: MUTED, marginTop: ".75rem" }}>
          Stato aggiornato in tempo reale · il lead associato viene conservato anche dopo la chiusura.
        </p>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
