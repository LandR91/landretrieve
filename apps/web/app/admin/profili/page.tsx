"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";
const TEXT_SOFT = "#374151";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  agentProfile: { id: string; isVerified: boolean } | null;
  agencyProfile: { id: string; isVerified: boolean } | null;
}

interface UserPage {
  items: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

const ROLES = ["VISITOR", "AGENT", "AGENCY", "ADMIN"];
const ROLE_LABELS: Record<string, string> = { VISITOR: "Visitatore", AGENT: "Agente", AGENCY: "Agenzia", ADMIN: "Admin" };
const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  VISITOR: { bg: "#f5f5f5", color: MUTED },
  AGENT: { bg: "#dbeafe", color: "#1d4ed8" },
  AGENCY: { bg: "#ede9fe", color: "#5b21b6" },
  ADMIN: { bg: "#fef9c3", color: "#854d0e" },
};

function userLabel(u: AdminUser) {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.displayName || u.email;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT");
}

export default function AdminProfiliPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [data, setData] = useState<UserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, role: roleFilter, page: String(page), limit: "20" });
      const res = await fetch(`${API_URL}/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      if (res.ok) setData(await res.json() as UserPage);
    } finally {
      setLoading(false);
    }
  }, [token, q, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function patchUser(id: string, patch: Record<string, unknown>) {
    setUpdatingId(id);
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(patch),
      });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((u) => (u.id === id ? { ...u, ...patch } : u)) } : prev,
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Eliminare questo utente? L'azione è irreversibile.")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((u) => u.id !== id), total: prev.total - 1 } : prev,
      );
    } finally {
      setDeletingId(null);
    }
  }

  const inputBase: React.CSSProperties = {
    padding: ".4rem .65rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".82rem", color: TEXT, background: "#fff", outline: "none", fontFamily: "inherit",
  };

  const btnPage: React.CSSProperties = {
    padding: ".35rem .75rem", border: `1px solid ${BORDER}`, borderRadius: 6,
    fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: "#fff", color: MUTED,
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Profili</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: ".6rem", marginBottom: ".85rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Cerca nome o email…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ ...inputBase, width: 240 }}
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={inputBase}>
          <option value="">Tutti i ruoli</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        {data && (
          <span style={{ marginLeft: "auto", fontSize: ".78rem", color: MUTED }}>{data.total} utenti</span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem", textAlign: "center" }}>
          <p style={{ color: MUTED, margin: 0, fontSize: ".85rem" }}>Nessun utente trovato.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: `1px solid ${BORDER}` }}>
                {["Utente", "Email", "Ruolo", "Attivo", "Verificato", "Creato", ""].map((h) => (
                  <th key={h} style={{ padding: ".65rem .85rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((u, i) => {
                const rs = ROLE_STYLE[u.role] ?? { bg: "#f5f5f5", color: MUTED };
                return (
                  <tr key={u.id} style={{ borderBottom: i < data.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <td style={{ padding: ".6rem .85rem" }}>
                      <div style={{ fontWeight: 600, fontSize: ".85rem", color: TEXT }}>{userLabel(u)}</div>
                    </td>
                    <td style={{ padding: ".6rem .85rem", fontSize: ".78rem", color: TEXT_SOFT }}>{u.email}</td>
                    <td style={{ padding: ".6rem .85rem" }}>
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        style={{ ...inputBase, padding: ".2rem .4rem", fontSize: ".75rem", background: rs.bg, color: rs.color, border: "none", fontWeight: 700, cursor: "pointer" }}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: ".6rem .85rem" }}>
                      <button
                        onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                        disabled={updatingId === u.id}
                        style={{ background: u.isActive ? "#dcfce7" : "#fee2e2", color: u.isActive ? "#15803d" : "#991b1b", border: "none", borderRadius: 4, padding: ".15rem .45rem", fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        {u.isActive ? "Sì" : "No"}
                      </button>
                    </td>
                    <td style={{ padding: ".6rem .85rem" }}>
                      <button
                        onClick={() => patchUser(u.id, { isVerified: !u.isVerified })}
                        disabled={updatingId === u.id}
                        style={{ background: u.isVerified ? "#dcfce7" : "#f5f5f5", color: u.isVerified ? "#15803d" : MUTED, border: "none", borderRadius: 4, padding: ".15rem .45rem", fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        {u.isVerified ? "✓" : "—"}
                      </button>
                    </td>
                    <td style={{ padding: ".6rem .85rem", fontSize: ".75rem", color: MUTED, whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: ".6rem .85rem" }}>
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={deletingId === u.id}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1rem", padding: ".2rem .4rem" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                        title="Elimina"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: ".5rem", marginTop: "1rem" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnPage, opacity: page === 1 ? 0.4 : 1 }}>← Prec.</button>
          <span style={{ padding: ".35rem .75rem", fontSize: ".8rem", color: MUTED }}>Pag. {page} / {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} style={{ ...btnPage, opacity: page === data.pages ? 0.4 : 1 }}>Succ. →</button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
