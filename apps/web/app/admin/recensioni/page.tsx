"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Review {
  id: string;
  targetId: string;
  targetType: string;
  title: string;
  body: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  author: { id: string; displayName: string | null; email: string };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: ".85rem" }}>
      {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
    </span>
  );
}

export default function AdminRecensioniPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("false");
  const [actingId, setActingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews?approved=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setReviews(await res.json() as Review[]);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function approve(id: string) {
    setActingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}/approve`, {
        method: "PATCH",
        headers,
        credentials: "include",
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Recensione approvata." });
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved: true } : r));
      }
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    setActingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Recensione eliminata." });
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setActingId(null);
    }
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: ".6rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: 0 }}>Moderazione Recensioni</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={inputBase}>
          <option value="false">In attesa</option>
          <option value="true">Approvate</option>
          <option value="">Tutte</option>
        </select>
      </div>

      {feedback && (
        <div style={{ padding: ".6rem .9rem", borderRadius: 7, marginBottom: "1rem", background: feedback.type === "ok" ? "#dcfce7" : "#fee2e2", color: feedback.type === "ok" ? "#15803d" : "#991b1b", fontSize: ".83rem" }}>
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>💬</div>
          <p style={{ color: MUTED, margin: 0, fontSize: ".85rem" }}>Nessuna recensione in questa categoria.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".4rem" }}>
                    <Stars rating={r.rating} />
                    <span style={{ fontSize: ".72rem", color: MUTED }}>
                      {r.targetType} · {new Date(r.createdAt).toLocaleDateString("it-IT")}
                    </span>
                    {r.isApproved && (
                      <span style={{ fontSize: ".68rem", background: "#dcfce7", color: "#15803d", padding: ".1rem .4rem", borderRadius: 3, fontWeight: 700 }}>Approvata</span>
                    )}
                  </div>
                  <p style={{ fontSize: ".88rem", fontWeight: 700, color: TEXT, margin: "0 0 .3rem" }}>{r.title}</p>
                  <p style={{ fontSize: ".82rem", color: MUTED, margin: "0 0 .5rem", lineHeight: 1.5 }}>{r.body}</p>
                  <span style={{ fontSize: ".75rem", color: MUTED }}>
                    Da: {r.author.displayName ?? r.author.email}
                  </span>
                </div>

                {!r.isApproved && (
                  <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                    <button
                      onClick={() => approve(r.id)}
                      disabled={actingId === r.id}
                      style={{ padding: ".4rem .9rem", background: GREEN, color: "#fff", border: "none", borderRadius: 6, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", opacity: actingId === r.id ? 0.6 : 1 }}
                    >
                      {actingId === r.id ? "…" : "Approva"}
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      disabled={actingId === r.id}
                      style={{ padding: ".4rem .9rem", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", opacity: actingId === r.id ? 0.6 : 1 }}
                    >
                      Rifiuta
                    </button>
                  </div>
                )}

                {r.isApproved && (
                  <button
                    onClick={() => reject(r.id)}
                    disabled={actingId === r.id}
                    style={{ padding: ".4rem .75rem", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                  >
                    Elimina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
