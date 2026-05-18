"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Professional {
  id: string;
  displayName: string | null;
  email: string;
  role: string;
  agentProfile: { isVerified: boolean } | null;
  agencyProfile: { isVerified: boolean } | null;
}

interface BadgedProfile {
  id: string;
  isVerified: boolean;
  user: { id: string; displayName: string | null; email: string };
}

interface BadgeData {
  agents: BadgedProfile[];
  agencies: BadgedProfile[];
}

export default function AdminBadgePage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [badged, setBadged] = useState<BadgeData | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchBadged = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/badge`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      if (res.ok) setBadged(await res.json() as BadgeData);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBadged(); }, [fetchBadged]);

  async function doSearch() {
    if (!token) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/badge/search?q=${encodeURIComponent(searchQ)}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setSearchResults(await res.json() as Professional[]);
    } finally {
      setSearching(false);
    }
  }

  async function addBadge(userId: string) {
    setApplying(userId);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/badge`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Badge assegnato." });
        setSearchResults((prev) => prev.map((p) =>
          p.id === userId
            ? { ...p, agentProfile: p.agentProfile ? { ...p.agentProfile, isVerified: true } : null, agencyProfile: p.agencyProfile ? { ...p.agencyProfile, isVerified: true } : null }
            : p,
        ));
        await fetchBadged();
      } else {
        setFeedback({ type: "err", msg: "Errore nell'assegnazione del badge." });
      }
    } finally {
      setApplying(null);
    }
  }

  async function removeBadge(userId: string) {
    setApplying(userId);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/badge/${userId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (res.ok) {
        setFeedback({ type: "ok", msg: "Badge rimosso." });
        await fetchBadged();
      } else {
        setFeedback({ type: "err", msg: "Errore nella rimozione del badge." });
      }
    } finally {
      setApplying(null);
    }
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  const btnPrimary: React.CSSProperties = {
    padding: ".4rem .9rem", background: GREEN, color: "#fff", border: "none",
    borderRadius: 6, fontSize: ".82rem", fontWeight: 600, cursor: "pointer",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.1rem", marginBottom: "1.1rem",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Gestione Badge</h1>

      {feedback && (
        <div style={{ padding: ".6rem .9rem", borderRadius: 7, marginBottom: "1rem", background: feedback.type === "ok" ? "#dcfce7" : "#fee2e2", color: feedback.type === "ok" ? "#15803d" : "#991b1b", fontSize: ".83rem" }}>
          {feedback.msg}
        </div>
      )}

      {/* Search & assign */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Assegna badge</h2>
        <div style={{ display: "flex", gap: ".5rem", marginBottom: ".85rem" }}>
          <input
            type="text"
            placeholder="Cerca agente o agenzia…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            style={{ ...inputBase, flex: 1 }}
          />
          <button onClick={doSearch} disabled={searching} style={btnPrimary}>
            {searching ? "…" : "Cerca"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            {searchResults.map((p, i) => {
              const isVerified = p.agentProfile?.isVerified ?? p.agencyProfile?.isVerified ?? false;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".6rem .85rem", borderBottom: i < searchResults.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".83rem", fontWeight: 600, color: TEXT }}>{p.displayName ?? p.email}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{p.email} · {p.role === "AGENT" ? "Agente" : "Agenzia"}</div>
                  </div>
                  {isVerified ? (
                    <span style={{ fontSize: ".72rem", background: "#dcfce7", color: "#15803d", padding: ".15rem .45rem", borderRadius: 4, fontWeight: 700 }}>✓ Verificato</span>
                  ) : (
                    <button
                      onClick={() => addBadge(p.id)}
                      disabled={applying === p.id}
                      style={btnPrimary}
                    >
                      {applying === p.id ? "…" : "Aggiungi badge"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Currently badged */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div style={{ width: 22, height: 22, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : (
        <div style={cardStyle}>
          <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Profili con badge attivo</h2>

          {(!badged || (badged.agents.length === 0 && badged.agencies.length === 0)) ? (
            <p style={{ fontSize: ".82rem", color: MUTED, margin: 0 }}>Nessun profilo con badge.</p>
          ) : (
            <>
              {[...badged.agents, ...badged.agencies].map((b, i, arr) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".5rem 0", borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: "1rem" }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".83rem", fontWeight: 600, color: TEXT }}>{b.user.displayName ?? b.user.email}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{b.user.email}</div>
                  </div>
                  <button
                    onClick={() => removeBadge(b.user.id)}
                    disabled={applying === b.user.id}
                    style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 5, padding: ".25rem .6rem", fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    {applying === b.user.id ? "…" : "Rimuovi"}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
