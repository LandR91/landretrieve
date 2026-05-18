"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CrmActivity {
  id: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  lead: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
}

interface ActivityPage {
  items: CrmActivity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function activityIcon(meta: Record<string, unknown> | null): string {
  if (!meta) return "📌";
  const type = meta.type as string | undefined;
  if (type === "offer") return "💰";
  if (type === "message") return "💬";
  if (type === "request") return "🏡";
  if (type === "status_change") return "🔄";
  if (type === "note") return "📝";
  return "📌";
}

function activityDescription(meta: Record<string, unknown> | null, lead: CrmActivity["lead"]): string {
  if (!meta) return "Attività registrata";
  const type = meta.type as string | undefined;
  const name = lead ? (`${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || lead.email) : "Utente";

  if (type === "offer") return `${name} ha inviato un'offerta`;
  if (type === "message") return `Nuovo messaggio da ${name}`;
  if (type === "request") return `${name} ha inviato una richiesta immobile`;
  if (type === "status_change") return `Stato aggiornato: ${meta.from as string ?? ""} → ${meta.to as string ?? ""}`;
  if (type === "note") return `Nota aggiunta${lead ? ` su ${name}` : ""}`;
  if (meta.description) return meta.description as string;
  return "Attività registrata";
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AttivitaPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [data, setData] = useState<ActivityPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("Azioni in blocco");
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/crm/activities?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setData(await res.json() as ActivityPage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  async function applyBulkAction() {
    if (bulkAction !== "Cancella" || selected.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selected);
    try {
      await fetch(`${API_URL}/api/crm/activities`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });
      setSelected(new Set());
      setBulkAction("Azioni in blocco");
      await fetchPage(page);
    } finally {
      setDeleting(false);
    }
  }

  async function deleteActivity(id: string) {
    await fetch(`${API_URL}/api/crm/activities`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ids: [id] }),
    });
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((a) => a.id !== id),
        total: prev.total - 1,
      };
    });
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((a) => selected.has(a.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); items.forEach((a) => s.delete(a.id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); items.forEach((a) => s.add(a.id)); return s; });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  const btnPage: React.CSSProperties = {
    padding: ".4rem .85rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", fontWeight: 600, cursor: "pointer", background: "#fff", color: TEXT_SOFT,
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Attività</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap", marginBottom: ".85rem" }}>
        {selected.size > 0 && (
          <>
            <span style={{ fontSize: ".78rem", color: MUTED }}>{selected.size} selezionate</span>
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
              disabled={bulkAction === "Azioni in blocco" || deleting}
              style={{
                padding: ".4rem .85rem",
                background: bulkAction === "Cancella" ? "#fee2e2" : "#f5f5f5",
                color: bulkAction === "Cancella" ? "#991b1b" : MUTED,
                border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: ".82rem", fontWeight: 600,
                cursor: bulkAction === "Azioni in blocco" || deleting ? "not-allowed" : "pointer",
              }}
            >
              {deleting ? "…" : "Applica"}
            </button>
          </>
        )}
        {data && (
          <div style={{ marginLeft: selected.size > 0 ? "0" : "auto", fontSize: ".78rem", color: MUTED }}>
            {data.total} attività totali
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>📊</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .3rem" }}>Nessuna attività</p>
          <p style={{ fontSize: ".83rem", color: MUTED, margin: 0 }}>Le attività vengono registrate automaticamente (offerte, messaggi, richieste).</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem .85rem", background: "#f9f9f9", borderBottom: `1px solid ${BORDER}` }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: GREEN, cursor: "pointer" }} />
            <span style={{ fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase" }}>Attività</span>
            <span style={{ marginLeft: "auto", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase" }}>Data</span>
          </div>

          {items.map((activity, i) => (
            <div
              key={activity.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: ".75rem", padding: ".85rem",
                borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : "none",
                background: selected.has(activity.id) ? "#f0fbf5" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(activity.id)}
                onChange={() => toggleOne(activity.id)}
                style={{ accentColor: GREEN, cursor: "pointer", marginTop: ".15rem", flexShrink: 0 }}
              />
              <div style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: ".05rem" }}>
                {activityIcon(activity.meta)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: ".85rem", color: TEXT, fontWeight: 500, margin: "0 0 .15rem", lineHeight: 1.4 }}>
                  {activityDescription(activity.meta, activity.lead)}
                </p>
                {activity.lead && (
                  <p style={{ fontSize: ".75rem", color: MUTED, margin: 0 }}>
                    Lead: {`${activity.lead.firstName ?? ""} ${activity.lead.lastName ?? ""}`.trim() || activity.lead.email}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                <span style={{ fontSize: ".75rem", color: MUTED, whiteSpace: "nowrap" }}>
                  {formatDate(activity.createdAt)}
                </span>
                <button
                  onClick={() => deleteActivity(activity.id)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1rem", padding: ".1rem .3rem", lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                  title="Elimina"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem", marginTop: "1rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...btnPage, opacity: page === 1 ? 0.4 : 1 }}
            onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.borderColor = GREEN; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          >
            ← Precedente
          </button>

          <div style={{ display: "flex", gap: ".25rem" }}>
            {Array.from({ length: data.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === data.pages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} style={{ display: "flex", alignItems: "center", gap: ".25rem" }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span style={{ color: MUTED, fontSize: ".82rem" }}>…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    style={{
                      ...btnPage,
                      background: p === page ? GREEN : "#fff",
                      color: p === page ? "#fff" : TEXT_SOFT,
                      borderColor: p === page ? GREEN : BORDER,
                      minWidth: 36,
                    }}
                    onMouseEnter={(e) => { if (p !== page) { e.currentTarget.style.backgroundColor = GREEN_DARK; e.currentTarget.style.color = "#fff"; } }}
                    onMouseLeave={(e) => { if (p !== page) { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = TEXT_SOFT; } }}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            style={{ ...btnPage, opacity: page === data.pages ? 0.4 : 1 }}
            onMouseEnter={(e) => { if (page !== data.pages) e.currentTarget.style.borderColor = GREEN; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          >
            Successiva →
          </button>

          <span style={{ fontSize: ".78rem", color: MUTED }}>
            Pag. {page} di {data.pages} ({data.total} totali)
          </span>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
