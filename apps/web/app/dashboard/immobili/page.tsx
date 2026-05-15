"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Search, Plus, Pencil, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

type PropertyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD" | "RENTED";

type Property = {
  id: string;
  title: string;
  tipologiaPadre: string;
  tipologiaFiglio: string;
  tipoContratto: "VENDITA" | "AFFITTO";
  prezzo: number;
  valuta: string;
  status: PropertyStatus;
  isInPrimoPiano: boolean;
  coverImage?: string;
  agent?: { firstName: string; lastName: string };
  createdAt: string;
};

type ApiResponse = {
  data: Property[];
  total: number;
  page: number;
  totalPages: number;
};

const PAGE_SIZE = 25;

const STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: "Bozza",
  PUBLISHED: "Pubblicato",
  ARCHIVED: "Archiviato",
  SOLD: "Venduto",
  RENTED: "Affittato",
};

const STATUS_COLORS: Record<PropertyStatus, { bg: string; color: string }> = {
  DRAFT: { bg: "#f3f4f6", color: "#374151" },
  PUBLISHED: { bg: "#dcfce7", color: "#166534" },
  ARCHIVED: { bg: "#f3f4f6", color: "#6b7280" },
  SOLD: { bg: "#dbeafe", color: "#1e40af" },
  RENTED: { bg: "#fef9c3", color: "#854d0e" },
};

const TIPO_OPTIONS = [
  "Terreno",
  "Rurale residenziale",
  "Struttura ricettiva",
  "Azienda agricola",
];

function formatPrezzo(prezzo: number, valuta: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: valuta,
    maximumFractionDigits: 0,
  }).format(prezzo);
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "middle",
};

function ActionBtn({
  href,
  title,
  target,
  children,
}: {
  href: string;
  title: string;
  target?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      target={target}
      style={{
        width: 30,
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        color: "#374151",
        textDecoration: "none",
        transition: "background-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </Link>
  );
}

export default function ImmobiliPage() {
  const { role } = useAuth();
  const isAgency = role === "AGENCY";

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterTipo) params.set("tipo", filterTipo);
      const res = await api.get<ApiResponse>(`/properties?${params}`);
      setProperties(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setProperties([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterTipo]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterTipo]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/properties/${id}`);
      setDeleteId(null);
      fetchProperties();
    } catch {
      // silent — show no error, just close
    } finally {
      setDeleting(false);
    }
  }

  const colCount = isAgency ? 6 : 5;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111", margin: 0 }}>
            I miei immobili
          </h1>
          <p style={{ fontSize: 14, color: "#4b5563", marginTop: 4 }}>
            {loading ? "Caricamento…" : `${total} annunci totali`}
          </p>
        </div>
        <Link
          href="/dashboard/immobili/nuovo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            backgroundColor: "#26A55B",
            color: "#ffffff",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
        >
          <Plus size={16} />
          Nuovo annuncio
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Cerca per titolo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              border: "1px solid #D4D4D4",
              borderRadius: 8,
              fontSize: 14,
              color: "#111111",
              outline: "none",
              backgroundColor: "#ffffff",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #D4D4D4",
            borderRadius: 8,
            fontSize: 14,
            color: "#111111",
            outline: "none",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
        >
          <option value="">Tutti gli stati</option>
          {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #D4D4D4",
            borderRadius: 8,
            fontSize: 14,
            color: "#111111",
            outline: "none",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
        >
          <option value="">Tutte le tipologie</option>
          {TIPO_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #D4D4D4",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #D4D4D4", backgroundColor: "#f9fafb" }}>
                <th style={thStyle}>Immobile</th>
                <th style={thStyle}>Tipologia / Contratto</th>
                <th style={thStyle}>Prezzo</th>
                {isAgency && <th style={thStyle}>Agente</th>}
                <th style={thStyle}>Stato</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={colCount}
                    style={{ padding: "48px 24px", textAlign: "center", color: "#6b7280", fontSize: 14 }}
                  >
                    Caricamento…
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    style={{ padding: "48px 24px", textAlign: "center", color: "#6b7280", fontSize: 14 }}
                  >
                    Nessun immobile trovato.{" "}
                    <Link href="/dashboard/immobili/nuovo" style={{ color: "#26A55B" }}>
                      Pubblica il primo annuncio
                    </Link>
                  </td>
                </tr>
              ) : (
                properties.map((prop, i) => (
                  <tr
                    key={prop.id}
                    style={{
                      borderBottom: i < properties.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")
                    }
                  >
                    {/* Thumbnail + title */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 64,
                            height: 48,
                            borderRadius: 6,
                            overflow: "hidden",
                            flexShrink: 0,
                            backgroundColor: "#f0fbf5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {prop.coverImage ? (
                            <Image
                              src={prop.coverImage}
                              alt={prop.title}
                              width={64}
                              height={48}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <span style={{ fontSize: 22 }}>🏡</span>
                          )}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "#111111" }}>
                              {prop.title}
                            </span>
                            {prop.isInPrimoPiano && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                In Primo Piano
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            {prop.tipologiaFiglio || prop.tipologiaPadre}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tipo / Contratto */}
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: "#374151" }}>{prop.tipologiaPadre}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {prop.tipoContratto === "VENDITA" ? "Vendita" : "Affitto"}
                      </div>
                    </td>

                    {/* Prezzo */}
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#111111", fontSize: 14, whiteSpace: "nowrap" }}>
                      {formatPrezzo(prop.prezzo, prop.valuta)}
                    </td>

                    {/* Agent — AGENCY only */}
                    {isAgency && (
                      <td style={{ ...tdStyle, fontSize: 13, color: "#374151" }}>
                        {prop.agent
                          ? `${prop.agent.firstName} ${prop.agent.lastName}`
                          : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>
                    )}

                    {/* Status badge */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 12,
                          fontWeight: 500,
                          padding: "3px 10px",
                          borderRadius: 20,
                          backgroundColor: STATUS_COLORS[prop.status].bg,
                          color: STATUS_COLORS[prop.status].color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {STATUS_LABELS[prop.status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 2 }}>
                        <ActionBtn href={`/dashboard/immobili/${prop.id}/modifica`} title="Modifica">
                          <Pencil size={14} />
                        </ActionBtn>
                        <ActionBtn href={`/immobili/${prop.id}`} title="Anteprima" target="_blank">
                          <Eye size={14} />
                        </ActionBtn>
                        <button
                          title="Elimina"
                          onClick={() => setDeleteId(prop.id)}
                          style={{
                            width: 30,
                            height: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            backgroundColor: "transparent",
                            transition: "background-color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Pagina {page} di {totalPages} — {total} risultati
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 14px",
                border: "1px solid #D4D4D4",
                borderRadius: 8,
                backgroundColor: "#ffffff",
                fontSize: 13,
                color: page === 1 ? "#9ca3af" : "#374151",
                cursor: page === 1 ? "default" : "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              <ChevronLeft size={14} /> Precedente
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 14px",
                border: "1px solid #D4D4D4",
                borderRadius: 8,
                backgroundColor: "#ffffff",
                fontSize: 13,
                color: page === totalPages ? "#9ca3af" : "#374151",
                cursor: page === totalPages ? "default" : "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              Successiva <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => { if (!deleting) setDeleteId(null); }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: 32,
              width: 380,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111111", margin: "0 0 8px" }}>
              Elimina annuncio
            </h3>
            <p style={{ fontSize: 14, color: "#4b5563", margin: "0 0 24px" }}>
              Sei sicuro di voler eliminare questo annuncio? L&apos;azione non può essere annullata.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                style={{
                  padding: "9px 18px",
                  border: "1px solid #D4D4D4",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Annulla
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#ffffff",
                  cursor: deleting ? "default" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.backgroundColor = "#b91c1c"; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
              >
                {deleting ? "Eliminazione…" : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
