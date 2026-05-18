"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ── Design tokens ──────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ──────────────────────────────────────────────────────────────────────
type Period = "24h" | "7d" | "30d" | "custom";

interface DataPoint { date: string; profileViews: number; propertyViews: number }
interface StatsData {
  series: DataPoint[];
  totalProfileViews: number;
  totalPropertyViews: number;
  myProperties: { id: string; title: string }[];
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: ".6rem .9rem", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
      <p style={{ margin: "0 0 .35rem", fontSize: ".75rem", fontWeight: 700, color: MUTED }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: "0 0 .2rem", fontSize: ".8rem", color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StatistichePage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [period, setPeriod] = useState<Period>("7d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    if (period === "custom" && (!startDate || !endDate)) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }
      if (propertyId) params.set("propertyId", propertyId);

      const res = await fetch(`${API_URL}/api/stats/dashboard?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setData(await res.json() as StatsData);
    } finally {
      setLoading(false);
    }
  }, [token, period, startDate, endDate, propertyId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const inputBase: React.CSSProperties = {
    padding: ".38rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  const btnPeriod = (p: Period): React.CSSProperties => ({
    padding: ".38rem .85rem", borderRadius: 6, border: `1px solid ${BORDER}`,
    fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
    background: period === p && p !== "custom" ? GREEN : "#fff",
    color: period === p && p !== "custom" ? "#fff" : MUTED,
    borderColor: period === p && p !== "custom" ? GREEN : BORDER,
  });

  const PERIODS: Array<{ key: Period; label: string }> = [
    { key: "24h", label: "24h" },
    { key: "7d", label: "7gg" },
    { key: "30d", label: "30gg" },
    { key: "custom", label: "Personalizzato" },
  ];

  return (
    <div>
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: ".75rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: 0 }}>Statistiche</h1>

        {/* Period toggles */}
        <div style={{ display: "flex", gap: ".35rem" }}>
          {PERIODS.map(({ key, label }) => (
            <button key={key} onClick={() => setPeriod(key)} style={btnPeriod(key)}>{label}</button>
          ))}
        </div>

        {/* Custom date range */}
        {period === "custom" && (
          <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputBase} />
            <span style={{ fontSize: ".75rem", color: MUTED }}>→</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputBase} />
            <button
              onClick={fetchStats}
              disabled={!startDate || !endDate}
              style={{ padding: ".38rem .8rem", background: GREEN, color: "#fff", border: "none", borderRadius: 6, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", opacity: !startDate || !endDate ? 0.5 : 1 }}
            >
              Applica
            </button>
          </div>
        )}

        {/* Property selector */}
        <div style={{ marginLeft: "auto" }}>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            style={{ ...inputBase, minWidth: 180 }}
          >
            <option value="">Tutti gli immobili</option>
            {(data?.myProperties ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.title.length > 35 ? p.title.slice(0, 35) + "…" : p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: ".35rem" }}>
            Visite profilo
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: PINK }}>
            {loading ? "—" : (data?.totalProfileViews ?? 0).toLocaleString("it-IT")}
          </div>
        </div>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: ".35rem" }}>
            Views immobili
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: BLUE }}>
            {loading ? "—" : (data?.totalPropertyViews ?? 0).toLocaleString("it-IT")}
          </div>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem", marginBottom: "1.25rem" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          </div>
        ) : !data || data.series.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, color: MUTED, fontSize: ".85rem" }}>
            Nessun dato per il periodo selezionato.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.series} margin={{ top: 4, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: MUTED }}
                interval={data.series.length > 14 ? Math.floor(data.series.length / 10) : 0}
              />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: ".8rem", color: MUTED }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="profileViews"
                name="Visite profilo"
                stroke={PINK}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: PINK }}
              />
              <Line
                type="monotone"
                dataKey="propertyViews"
                name="Views immobili"
                stroke={BLUE}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: BLUE }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Info note ─────────────────────────────────────────────────────── */}
      <p style={{ fontSize: ".72rem", color: MUTED, margin: 0 }}>
        Visite profilo = accessi alla tua pagina pubblica · Views immobili = visualizzazioni dei tuoi annunci
      </p>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
