"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

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
interface CrmLead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  mobile: string | null;
  city: string | null;
  country: string | null;
  source: string | null;
  status: string | null;
  createdAt: string;
  _count: { deals: number; enquiries: number };
}

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["new", "contacted", "qualified", "lost"];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  new:        { bg: "#fef9c3", color: "#854d0e", label: "Nuovo" },
  contacted:  { bg: "#dbeafe", color: "#1d4ed8", label: "Contattato" },
  qualified:  { bg: GREEN_LIGHT, color: GREEN_DARK, label: "Qualificato" },
  lost:       { bg: "#fee2e2", color: "#991b1b", label: "Perso" },
};

const SOURCE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  offer:  { bg: "#ede9fe", color: "#5b21b6", label: "Offerta" },
  manual: { bg: "#f5f5f5", color: MUTED, label: "Manuale" },
  form:   { bg: "#e0f2fe", color: "#0369a1", label: "Form" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Oggi";
  if (d === 1) return "Ieri";
  if (d < 7) return `${d}gg fa`;
  return new Date(iso).toLocaleDateString("it-IT");
}

function leadName(lead: CrmLead) {
  return `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || lead.email;
}

function StatusBadge({ status }: { status: string | null }) {
  const s = STATUS_STYLE[status ?? ""] ?? { bg: "#f5f5f5", color: MUTED, label: status ?? "—" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: ".68rem", fontWeight: 700, padding: ".18rem .5rem", borderRadius: 4, letterSpacing: ".04em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  const s = SOURCE_STYLE[source ?? ""] ?? { bg: "#f5f5f5", color: MUTED, label: source ?? "—" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: ".68rem", fontWeight: 600, padding: ".15rem .45rem", borderRadius: 3 }}>
      {s.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeadPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("Azioni in blocco");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/crm/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setLeads(await res.json() as CrmLead[]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await fetch(`${API_URL}/api/crm/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    } finally {
      setUpdatingId(null);
    }
  }

  async function applyBulkAction() {
    if (bulkAction !== "Cancella" || selected.size === 0) return;
    const ids = Array.from(selected);
    await fetch(`${API_URL}/api/crm/leads`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });
    setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
    setBulkAction("Azioni in blocco");
  }

  async function deleteLead(id: string) {
    await fetch(`${API_URL}/api/crm/leads`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ids: [id] }),
    });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  const filtered = leads.filter((l) => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return leadName(l).toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    }
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); filtered.forEach((l) => s.delete(l.id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); filtered.forEach((l) => s.add(l.id)); return s; });
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
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Lead</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginBottom: ".85rem" }}>
        <input
          type="text"
          placeholder="Cerca nome o email…"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{ ...inputBase, width: 220 }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputBase }}
        >
          <option value="">Tutti gli stati</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_STYLE[s]?.label ?? s}</option>
          ))}
        </select>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginLeft: "auto" }}>
            <span style={{ fontSize: ".78rem", color: MUTED }}>{selected.size} selezionati</span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              style={{ ...inputBase }}
            >
              <option>Azioni in blocco</option>
              <option value="Cancella">Cancella</option>
            </select>
            <button
              onClick={applyBulkAction}
              disabled={bulkAction === "Azioni in blocco"}
              style={{
                padding: ".4rem .85rem", background: bulkAction === "Cancella" ? "#fee2e2" : "#f5f5f5",
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
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>👤</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .3rem" }}>Nessun lead</p>
          <p style={{ fontSize: ".83rem", color: MUTED, margin: 0 }}>I lead vengono creati automaticamente quando un visitatore invia un&apos;offerta.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ width: 40, padding: ".75rem .85rem" }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: GREEN, cursor: "pointer" }} />
                </th>
                {["Nome", "Email / Tel", "Provenienza", "Stato", "Città", "Creato", ""].map((h) => (
                  <th key={h} style={{ padding: ".75rem .85rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none", background: selected.has(lead.id) ? "#f0fbf5" : "transparent" }}
                >
                  <td style={{ padding: ".65rem .85rem" }}>
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} style={{ accentColor: GREEN, cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <div style={{ fontWeight: 600, fontSize: ".85rem", color: TEXT }}>{leadName(lead)}</div>
                    {(lead._count.deals > 0 || lead._count.enquiries > 0) && (
                      <div style={{ fontSize: ".68rem", color: MUTED, marginTop: ".1rem" }}>
                        {lead._count.deals > 0 && `${lead._count.deals} accordi`}
                        {lead._count.deals > 0 && lead._count.enquiries > 0 && " · "}
                        {lead._count.enquiries > 0 && `${lead._count.enquiries} richieste`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <div style={{ fontSize: ".82rem", color: TEXT_SOFT }}>{lead.email}</div>
                    {lead.mobile && <div style={{ fontSize: ".75rem", color: MUTED }}>{lead.mobile}</div>}
                  </td>
                  <td style={{ padding: ".65rem .85rem" }}><SourceBadge source={lead.source} /></td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <select
                      value={lead.status ?? "new"}
                      disabled={updatingId === lead.id}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      style={{ ...inputBase, padding: ".25rem .45rem", fontSize: ".75rem", cursor: "pointer" }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_STYLE[s]?.label ?? s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: ".65rem .85rem", fontSize: ".82rem", color: TEXT_SOFT }}>
                    {[lead.city, lead.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td style={{ padding: ".65rem .85rem", fontSize: ".78rem", color: MUTED, whiteSpace: "nowrap" }}>{relativeDate(lead.createdAt)}</td>
                  <td style={{ padding: ".65rem .85rem" }}>
                    <button
                      onClick={() => deleteLead(lead.id)}
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
