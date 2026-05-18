"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Property {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface IPPEntry {
  id: string;
  propertyId: string;
  isActive: boolean;
  startDate: string;
  price: number;
  property: { id: string; title: string; slug: string } | null;
}

export default function AdminIPPPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [activeIPP, setActiveIPP] = useState<IPPEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [selectedProp, setSelectedProp] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchIPP = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/ipp`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      if (res.ok) setActiveIPP(await res.json() as IPPEntry[]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchIPP(); }, [fetchIPP]);

  async function searchProperties() {
    if (!token) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/properties?q=${encodeURIComponent(searchQ)}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setProperties(await res.json() as Property[]);
    } finally {
      setSearching(false);
    }
  }

  async function addIPP() {
    if (!selectedProp) return;
    setAdding(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/ipp`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ propertyId: selectedProp }),
      });
      if (res.ok) {
        const data = await res.json() as { success: boolean; alreadyActive?: boolean };
        if (data.alreadyActive) {
          setFeedback({ type: "err", msg: "Immobile già In Primo Piano." });
        } else {
          setFeedback({ type: "ok", msg: "Immobile aggiunto In Primo Piano." });
          setSelectedProp("");
          await fetchIPP();
        }
      } else {
        setFeedback({ type: "err", msg: "Errore nell'attivazione." });
      }
    } finally {
      setAdding(false);
    }
  }

  async function deactivate(id: string) {
    setDeactivatingId(id);
    try {
      await fetch(`${API_URL}/api/admin/ipp/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      setActiveIPP((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeactivatingId(null);
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
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Gestione In Primo Piano (IPP)</h1>

      {feedback && (
        <div style={{ padding: ".6rem .9rem", borderRadius: 7, marginBottom: "1rem", background: feedback.type === "ok" ? "#dcfce7" : "#fee2e2", color: feedback.type === "ok" ? "#15803d" : "#991b1b", fontSize: ".83rem" }}>
          {feedback.msg}
        </div>
      )}

      {/* Add IPP */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Aggiungi slot IPP</h2>
        <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
          <input
            type="text"
            placeholder="Cerca immobile per titolo…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchProperties()}
            style={{ ...inputBase, flex: 1 }}
          />
          <button onClick={searchProperties} disabled={searching} style={btnPrimary}>
            {searching ? "…" : "Cerca"}
          </button>
        </div>

        {properties.length > 0 && (
          <div style={{ marginBottom: ".75rem" }}>
            <select
              value={selectedProp}
              onChange={(e) => setSelectedProp(e.target.value)}
              style={{ ...inputBase, width: "100%" }}
            >
              <option value="">Seleziona immobile…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title} [{p.status}]</option>
              ))}
            </select>
          </div>
        )}

        <button onClick={addIPP} disabled={!selectedProp || adding} style={{ ...btnPrimary, opacity: !selectedProp || adding ? 0.6 : 1 }}>
          {adding ? "…" : "Attiva IPP"}
        </button>
      </div>

      {/* Active IPP list */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>
          Slot IPP attivi ({activeIPP.length})
        </h2>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
            <div style={{ width: 22, height: 22, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          </div>
        ) : activeIPP.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: MUTED, margin: 0 }}>Nessuno slot attivo.</p>
        ) : (
          activeIPP.map((entry, i) => (
            <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".55rem 0", borderBottom: i < activeIPP.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontSize: "1rem" }}>⭐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".83rem", fontWeight: 600, color: TEXT }}>
                  {entry.property?.title ?? entry.propertyId}
                </div>
                <div style={{ fontSize: ".72rem", color: MUTED }}>
                  Attivo dal {new Date(entry.startDate).toLocaleDateString("it-IT")}
                  {entry.price > 0 && ` · €${Number(entry.price).toFixed(2)}/mese`}
                </div>
              </div>
              <button
                onClick={() => deactivate(entry.id)}
                disabled={deactivatingId === entry.id}
                style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 5, padding: ".25rem .6rem", fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}
              >
                {deactivatingId === entry.id ? "…" : "Disattiva"}
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
