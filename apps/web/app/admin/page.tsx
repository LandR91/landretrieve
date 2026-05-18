"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

function StatCard({ label, value, icon, href }: { label: string; value: string | number; icon: string; href?: string }) {
  const inner = (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.1rem" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: ".3rem" }}>{icon}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: TEXT }}>{value}</div>
      <div style={{ fontSize: ".78rem", color: MUTED, marginTop: ".1rem" }}>{label}</div>
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setStats(await res.json() as Stats);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const btnTab: React.CSSProperties = {
    padding: ".35rem .8rem", borderRadius: 6, border: `1px solid ${BORDER}`,
    fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: "#fff", color: MUTED,
  };

  const roleLabels: Record<string, string> = { ADMIN: "Admin", AGENCY: "Agenzie", AGENT: "Agenti", VISITOR: "Visitatori" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: 0 }}>Panoramica</h1>
        <div style={{ display: "flex", gap: ".4rem" }}>
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{ ...btnTab, ...(days === d ? { background: GREEN, color: "#fff", borderColor: GREEN } : {}) }}
            >
              {d}gg
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : stats ? (
        <>
          {/* Stat cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".85rem", marginBottom: "1.5rem" }}>
            <StatCard label={`Visualizzazioni immobili (${days}gg)`} value={stats.totalPropertyViews.toLocaleString("it-IT")} icon="👁️" href="/admin/statistiche" />
            <StatCard label={`Visite categorie (${days}gg)`} value={stats.totalCategoryViews.toLocaleString("it-IT")} icon="📂" href="/admin/statistiche" />
            <StatCard label={`Nuovi utenti (${days}gg)`} value={stats.newUsers} icon="👤" href="/admin/profili" />
            <StatCard label={`Fatturato (${days}gg)`} value={`€${Number(stats.revenue).toFixed(2)}`} icon="💶" />
            <StatCard label="Segnalazioni messaggi" value={stats.violations} icon="🚩" href="/admin/segnalazioni" />
            <StatCard label="Recensioni in attesa" value={stats.pendingReviews} icon="💬" href="/admin/recensioni" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Users by role */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem" }}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Profili per ruolo</h3>
              {stats.usersByRole.map((r) => (
                <div key={r.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".3rem 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: ".82rem", color: MUTED }}>{roleLabels[r.role] ?? r.role}</span>
                  <span style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT }}>{r.count}</span>
                </div>
              ))}
            </div>

            {/* Views by category */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem" }}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Visite per categoria</h3>
              {stats.viewsByCategory.length === 0 ? (
                <p style={{ fontSize: ".8rem", color: MUTED, margin: 0 }}>Nessun dato per il periodo.</p>
              ) : stats.viewsByCategory.slice(0, 6).map((c) => {
                const max = stats.viewsByCategory[0]?.count ?? 1;
                return (
                  <div key={c.slug} style={{ marginBottom: ".5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: MUTED, marginBottom: ".15rem" }}>
                      <span>{c.slug}</span><span>{c.count}</span>
                    </div>
                    <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(c.count / max) * 100}%`, background: GREEN, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top properties */}
          {stats.topProperties.length > 0 && (
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem", marginTop: "1rem" }}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Top 10 immobili per visite ({days}gg)</h3>
              {stats.topProperties.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".4rem 0", borderBottom: i < stats.topProperties.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: ".75rem", color: MUTED, width: 18, textAlign: "right" }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: ".82rem", color: TEXT, fontWeight: 500 }}>{p.title}</span>
                  <span style={{ fontSize: ".82rem", fontWeight: 700, color: GREEN }}>{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: MUTED, fontSize: ".85rem" }}>Errore nel caricamento delle statistiche.</p>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
