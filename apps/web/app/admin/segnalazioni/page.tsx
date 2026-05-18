"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Violation {
  id: string;
  userId: string;
  content: string;
  reason: string;
  createdAt: string;
  user: { id: string; displayName: string | null; email: string };
}

interface ViolationPage {
  items: Violation[];
  total: number;
  page: number;
  pages: number;
}

const REASON_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  profanity: { bg: "#fee2e2", color: "#991b1b", label: "Linguaggio vietato" },
  external_link: { bg: "#fef9c3", color: "#854d0e", label: "Link esterno" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminSegnalazioniPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [data, setData] = useState<ViolationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchViolations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/violations?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setData(await res.json() as ViolationPage);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => { fetchViolations(); }, [fetchViolations]);

  const btnPage: React.CSSProperties = {
    padding: ".35rem .75rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: "#fff", color: MUTED,
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: 0 }}>Segnalazioni messaggistica</h1>
        {data && (
          <span style={{ fontSize: ".78rem", color: MUTED }}>{data.total} segnalazioni totali</span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🚩</div>
          <p style={{ color: MUTED, margin: 0, fontSize: ".85rem" }}>Nessuna segnalazione registrata.</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9f9f9", borderBottom: `1px solid ${BORDER}` }}>
                  {["Data", "Utente", "Tipo", "Contenuto"].map((h) => (
                    <th key={h} style={{ padding: ".65rem .85rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((v, i) => {
                  const rs = REASON_STYLE[v.reason] ?? { bg: "#f5f5f5", color: MUTED, label: v.reason };
                  return (
                    <tr key={v.id} style={{ borderBottom: i < data.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <td style={{ padding: ".6rem .85rem", fontSize: ".75rem", color: MUTED, whiteSpace: "nowrap" }}>
                        {formatDate(v.createdAt)}
                      </td>
                      <td style={{ padding: ".6rem .85rem" }}>
                        <div style={{ fontSize: ".83rem", fontWeight: 600, color: TEXT }}>{v.user.displayName ?? v.user.email}</div>
                        <div style={{ fontSize: ".72rem", color: MUTED }}>{v.user.email}</div>
                      </td>
                      <td style={{ padding: ".6rem .85rem" }}>
                        <span style={{ fontSize: ".7rem", fontWeight: 700, background: rs.bg, color: rs.color, padding: ".15rem .45rem", borderRadius: 4 }}>
                          {rs.label}
                        </span>
                      </td>
                      <td style={{ padding: ".6rem .85rem", maxWidth: 300 }}>
                        <p style={{ fontSize: ".78rem", color: MUTED, margin: 0, fontFamily: "monospace", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {v.content}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: ".5rem", marginTop: "1rem" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnPage, opacity: page === 1 ? 0.4 : 1 }}>← Prec.</button>
              <span style={{ padding: ".35rem .75rem", fontSize: ".8rem", color: MUTED }}>Pag. {page} / {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} style={{ ...btnPage, opacity: page === data.pages ? 0.4 : 1 }}>Succ. →</button>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
