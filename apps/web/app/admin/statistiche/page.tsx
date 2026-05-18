"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Stats {
  totalPropertyViews: number;
  totalCategoryViews: number;
  newUsers: number;
  revenue: number;
  violations: number;
  pendingReviews: number;
  usersByRole: { role: string; count: number }[];
  viewsByCategory: { slug: string; count: number }[];
  topProperties: { id: string; title: string; slug: string; views: number }[];
}

const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", AGENCY: "Agenzie", AGENT: "Agenti", VISITOR: "Visitatori" };

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".45rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: ".83rem", color: MUTED }}>{label}</span>
      <span style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT }}>{value}</span>
    </div>
  );
}

function BarChart({ data, maxLabel }: { data: { label: string; value: number }[]; maxLabel?: string }) {
  const max = data[0]?.value ?? 1;
  return (
    <div>
      {data.map((d) => (
        <div key={d.label} style={{ marginBottom: ".65rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: MUTED, marginBottom: ".2rem" }}>
            <span>{d.label}</span>
            <span style={{ fontWeight: 600 }}>{d.value}{maxLabel}</span>
          </div>
          <div style={{ height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(4, (d.value / max) * 100)}%`, background: GREEN, borderRadius: 4, transition: "width .4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatistichePage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [customDays, setCustomDays] = useState("");

  const activeDays = customDays ? parseInt(customDays) || 7 : days;

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats?days=${activeDays}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setStats(await res.json() as Stats);
    } finally {
      setLoading(false);
    }
  }, [token, activeDays]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const btnBase: React.CSSProperties = {
    padding: ".35rem .8rem", borderRadius: 6, border: `1px solid ${BORDER}`,
    fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: "#fff", color: MUTED,
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: 0 }}>Statistiche</h1>

        <div style={{ display: "flex", gap: ".4rem", alignItems: "center", marginLeft: "auto" }}>
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => { setDays(d); setCustomDays(""); }}
              style={{ ...btnBase, ...(days === d && !customDays ? { background: GREEN, color: "#fff", borderColor: GREEN } : {}) }}
            >
              {d}gg
            </button>
          ))}
          <input
            type="number"
            min="1"
            max="365"
            placeholder="Giorni…"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            style={{ padding: ".35rem .6rem", border: `1px solid ${BORDER}`, borderRadius: 6, width: 90, fontSize: ".8rem", outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : !stats ? (
        <p style={{ color: MUTED }}>Errore nel caricamento.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {/* Summary metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            <div style={cardStyle}>
              <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".3rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Visite immobili ({activeDays}gg)</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: TEXT }}>{stats.totalPropertyViews.toLocaleString("it-IT")}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".3rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Visite categorie ({activeDays}gg)</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: TEXT }}>{stats.totalCategoryViews.toLocaleString("it-IT")}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".3rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Nuovi iscritti ({activeDays}gg)</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: TEXT }}>{stats.newUsers}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: ".75rem", color: MUTED, marginBottom: ".3rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Fatturato ({activeDays}gg)</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: GREEN }}>
                €{Number(stats.revenue).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Views by category */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 1rem" }}>
                Visite per categoria ({activeDays}gg)
              </h3>
              {stats.viewsByCategory.length === 0 ? (
                <p style={{ fontSize: ".8rem", color: MUTED, margin: 0 }}>Nessun dato.</p>
              ) : (
                <BarChart data={stats.viewsByCategory.slice(0, 8).map((c) => ({ label: c.slug, value: c.count }))} />
              )}
            </div>

            {/* Users by role */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 1rem" }}>Profili per ruolo (totale)</h3>
              {stats.usersByRole.map((r) => (
                <MetricRow key={r.role} label={ROLE_LABELS[r.role] ?? r.role} value={r.count} />
              ))}
            </div>
          </div>

          {/* Top properties */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 1rem" }}>
              Top 10 immobili per visite ({activeDays}gg)
            </h3>
            {stats.topProperties.length === 0 ? (
              <p style={{ fontSize: ".8rem", color: MUTED, margin: 0 }}>Nessun dato.</p>
            ) : (
              <BarChart
                data={stats.topProperties.map((p) => ({
                  label: p.title.length > 40 ? p.title.slice(0, 40) + "…" : p.title,
                  value: p.views,
                }))}
              />
            )}
          </div>

          {/* Summary table */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 1rem" }}>Riepilogo moderazione</h3>
            <MetricRow label={`Segnalazioni messaggi (${activeDays}gg)`} value={stats.violations} />
            <MetricRow label="Recensioni in attesa di approvazione" value={stats.pendingReviews} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
