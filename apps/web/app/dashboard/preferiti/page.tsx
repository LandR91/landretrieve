"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

interface FavoriteProperty {
  id: string;
  title: string;
  tipologiaPadre: string;
  tipologiaFiglio: string;
  tipoContratto: "VENDITA" | "AFFITTO";
  prezzo: number;
  valuta: string;
  status: string;
  comune?: string;
  provincia?: string;
  superficie?: number;
  superficieTerreno?: number;
  camere?: number;
  bagni?: number;
  coverImage?: string | null;
  savedAt: string;
}

function formatPrice(price: number, valuta: string): string {
  const sym = valuta === "EUR" ? "€" : valuta;
  if (price >= 1_000_000) return `${sym}${(price / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (price >= 1_000) return `${sym}${Math.round(price / 1_000)}k`;
  return `${sym}${price}`;
}

export default function PreferitiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [items, setItems] = useState<FavoriteProperty[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get<FavoriteProperty[]>("/api/favorites");
      setItems(data);
    } finally {
      setLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated") void load();
  }, [status, load]);

  async function handleRemove(id: string) {
    setRemoving((prev) => new Set(prev).add(id));
    try {
      await api.delete(`/api/favorites/${id}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (status === "loading" || !loaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>
        Preferiti
        {items.length > 0 && (
          <span style={{ marginLeft: ".5rem", fontSize: ".85rem", fontWeight: 500, color: MUTED }}>
            ({items.length})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>&#10084;</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .4rem" }}>Nessun preferito</p>
          <p style={{ fontSize: ".85rem", color: MUTED, margin: "0 0 1.25rem", lineHeight: 1.6 }}>
            Salva gli immobili che ti interessano cliccando sull&apos;icona segnalibro nelle schede.
          </p>
          <button
            onClick={() => router.push("/cerca")}
            style={{
              padding: ".6rem 1.4rem", background: GREEN, color: "#fff",
              border: "none", borderRadius: 7, fontWeight: 600, fontSize: ".88rem",
              cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
          >
            Sfoglia immobili
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {items.map((prop) => {
            const isRemoving = removing.has(prop.id);
            return (
              <div
                key={prop.id}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  opacity: isRemoving ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {/* Cover image */}
                <div
                  onClick={() => router.push(`/immobili/${prop.id}`)}
                  style={{ position: "relative", height: 180, overflow: "hidden", cursor: "pointer", background: "#f5f5f5" }}
                >
                  {prop.coverImage ? (
                    <img
                      src={prop.coverImage}
                      alt={prop.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", fontSize: 36 }}>
                      &#127968;
                    </div>
                  )}
                  <div style={{
                    position: "absolute", top: 8, left: 8,
                    background: prop.tipoContratto === "VENDITA" ? GREEN : "#2563eb",
                    color: "#fff", fontSize: ".65rem", fontWeight: 700,
                    padding: ".2rem .5rem", borderRadius: 4, letterSpacing: ".04em",
                  }}>
                    {prop.tipoContratto === "VENDITA" ? "VENDITA" : "AFFITTO"}
                  </div>
                  {prop.status === "IN_PRIMO_PIANO" && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      background: "#f59e0b", color: "#fff", fontSize: ".65rem", fontWeight: 700,
                      padding: ".2rem .5rem", borderRadius: 4, letterSpacing: ".04em",
                    }}>
                      IN PRIMO PIANO
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: ".85rem 1rem" }}>
                  <p
                    onClick={() => router.push(`/immobili/${prop.id}`)}
                    style={{ fontSize: ".88rem", fontWeight: 700, color: TEXT, margin: "0 0 .3rem", cursor: "pointer", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}
                  >
                    {prop.title}
                  </p>

                  {(prop.comune || prop.provincia) && (
                    <p style={{ fontSize: ".75rem", color: MUTED, margin: "0 0 .5rem" }}>
                      &#128205; {[prop.comune, prop.provincia].filter(Boolean).join(" (")}
                      {prop.provincia ? ")" : ""}
                    </p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".25rem", marginBottom: ".6rem" }}>
                    <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: ".68rem", fontWeight: 700, padding: ".15rem .4rem", borderRadius: 3 }}>
                      {prop.tipologiaFiglio || prop.tipologiaPadre}
                    </span>
                    {prop.camere != null && (
                      <span style={{ background: "#f5f5f5", color: MUTED, fontSize: ".68rem", fontWeight: 600, padding: ".15rem .4rem", borderRadius: 3 }}>
                        {prop.camere} cam
                      </span>
                    )}
                    {prop.superficie != null && (
                      <span style={{ background: "#f5f5f5", color: MUTED, fontSize: ".68rem", fontWeight: 600, padding: ".15rem .4rem", borderRadius: 3 }}>
                        {prop.superficie} m²
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: GREEN }}>
                      {formatPrice(prop.prezzo, prop.valuta)}
                    </span>
                    <button
                      onClick={() => void handleRemove(prop.id)}
                      disabled={isRemoving}
                      title="Rimuovi dai preferiti"
                      style={{
                        background: "transparent", border: "none", cursor: isRemoving ? "not-allowed" : "pointer",
                        color: "#dc2626", fontSize: ".75rem", fontWeight: 600, padding: ".25rem .5rem",
                        borderRadius: 5, fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => { if (!isRemoving) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
