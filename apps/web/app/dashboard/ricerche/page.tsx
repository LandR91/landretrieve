"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { COMUNI } from "@/lib/istat";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Tipologie hierarchy ────────────────────────────────────────────────────────
const TIPOLOGIE: Record<string, string[]> = {
  Terreno: ["Agricolo", "Edificabile", "Boschivo", "Pascolo"],
  "Rurale residenziale": ["Casale", "Cascina", "Masseria", "Trullo", "Baita", "Rustico"],
  "Struttura ricettiva": ["Agriturismo", "Bed & Breakfast", "Albergo", "Rifugio"],
  "Azienda agricola": ["Vitivinicola", "Olivicola", "Zootecnica", "Mista"],
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface PropertyRequest {
  id: string;
  propertyTypes: string[];
  searchComuni: string[];
  priceMin: number | null;
  priceMax: number | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface FormState {
  liveCountry: string;
  liveCity: string;
  priceMin: string;
  priceMax: string;
  message: string;
  privacy: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Oggi";
  if (d === 1) return "Ieri";
  if (d < 7) return `${d} giorni fa`;
  return new Date(iso).toLocaleDateString("it-IT");
}

function inputStyle(focused: boolean, error?: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: ".5rem .7rem",
    border: `1.5px solid ${error ? "#dc2626" : focused ? GREEN : BORDER}`,
    borderRadius: 7,
    fontSize: ".85rem",
    color: TEXT,
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .2s",
  };
}

function Tag({ label, onRemove, color = "green" }: { label: string; onRemove: () => void; color?: "green" | "gray" }) {
  const bg = color === "green" ? GREEN_LIGHT : "#f5f5f5";
  const fg = color === "green" ? GREEN : MUTED;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", background: bg, color: fg, fontSize: ".75rem", fontWeight: 600, padding: ".18rem .45rem .18rem .55rem", borderRadius: 4 }}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        style={{ background: "transparent", border: "none", cursor: "pointer", color: fg, lineHeight: 1, padding: 0, fontSize: ".9rem" }}
      >
        ×
      </button>
    </span>
  );
}

// ── Comuni autocomplete ────────────────────────────────────────────────────────
function ComuniSelect({ selected, onChange, error }: {
  selected: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = query.trim().length >= 1
    ? COMUNI.filter((c) =>
        c.nome.toLowerCase().includes(query.toLowerCase()) &&
        !selected.includes(`${c.nome} (${c.provincia})`)
      ).slice(0, 8)
    : [];

  function add(nome: string, provincia: string) {
    const label = `${nome} (${provincia})`;
    if (!selected.includes(label)) onChange([...selected, label]);
    setQuery("");
    setOpen(false);
  }

  function remove(label: string) {
    onChange(selected.filter((s) => s !== label));
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginBottom: ".4rem" }}>
          {selected.map((s) => <Tag key={s} label={s} onRemove={() => remove(s)} />)}
        </div>
      )}
      <input
        type="text"
        placeholder="Cerca comune… (es. Siena)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setFocused(true); setOpen(true); }}
        onBlur={() => setFocused(false)}
        style={inputStyle(focused, !!error)}
      />
      {error && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{error}</p>}
      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
          {results.map((c) => (
            <button
              key={`${c.nome}-${c.provincia}`}
              type="button"
              onMouseDown={() => add(c.nome, c.provincia)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: ".5rem .75rem", fontSize: ".83rem", color: TEXT, background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {c.nome} <span style={{ color: MUTED, fontSize: ".75rem" }}>({c.provincia})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tipologie multi-select ────────────────────────────────────────────────────
function TipologieSelect({ selected, onChange, error }: {
  selected: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function toggleGroup(g: string) {
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  }

  function toggleType(t: string) {
    if (selected.includes(t)) {
      onChange(selected.filter((s) => s !== t));
    } else {
      onChange([...selected, t]);
    }
  }

  function removeType(t: string) {
    onChange(selected.filter((s) => s !== t));
  }

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginBottom: ".65rem" }}>
          {selected.map((t) => <Tag key={t} label={t} onRemove={() => removeType(t)} />)}
        </div>
      )}
      <div style={{ border: `1.5px solid ${error ? "#dc2626" : BORDER}`, borderRadius: 7, overflow: "hidden" }}>
        {Object.entries(TIPOLOGIE).map(([parent, children], gi) => {
          const isOpen = openGroups[parent] ?? false;
          const selectedCount = children.filter((c) => selected.includes(c)).length;
          const allSelected = selectedCount === children.length;
          return (
            <div key={parent} style={{ borderTop: gi > 0 ? `1px solid ${BORDER}` : "none" }}>
              <button
                type="button"
                onClick={() => toggleGroup(parent)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: ".6rem .85rem", background: isOpen ? "#f9f9f9" : "#fff", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: ".85rem", fontWeight: 600, color: TEXT }}>{parent}</span>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                  {selectedCount > 0 && (
                    <span style={{ fontSize: ".65rem", fontWeight: 700, background: GREEN_LIGHT, color: GREEN, padding: ".1rem .4rem", borderRadius: 3 }}>
                      {allSelected ? "tutti" : selectedCount}
                    </span>
                  )}
                  <span style={{ color: MUTED, fontSize: ".75rem", transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform .15s" }}>▶</span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: ".4rem .85rem .65rem", background: "#fafafa", display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".3rem" }}>
                  {children.map((child) => (
                    <label key={child} style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", fontSize: ".83rem", color: TEXT_SOFT }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(child)}
                        onChange={() => toggleType(child)}
                        style={{ accentColor: GREEN, width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
                      />
                      {child}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{error}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CercaImmobilePage() {
  const { data: session, status } = useSession();
  const user = session?.user as {
    id?: string; firstName?: string; lastName?: string; email?: string;
    phone?: string; avatar?: string; accessToken?: string; role?: string;
  } | undefined;

  const [form, setForm] = useState<FormState>({ liveCountry: "", liveCity: "", priceMin: "", priceMax: "", message: "", privacy: false });
  const [selectedComuni, setSelectedComuni] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);

  const token = user?.accessToken ?? "";

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/property-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) setRequests(await res.json() as PropertyRequest[]);
    } finally {
      setRequestsLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated") fetchRequests();
  }, [status, fetchRequests]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Avatar gate
  if (status === "authenticated" && !user?.avatar) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Cerca Immobile</h1>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2rem 1.5rem", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>📸</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .4rem" }}>Foto profilo richiesta</p>
          <p style={{ fontSize: ".85rem", color: MUTED, margin: "0 0 1.25rem", lineHeight: 1.6 }}>
            Per cercare un immobile devi prima caricare una <strong>foto profilo</strong>. Aiuta i professionisti a riconoscerti.
          </p>
          <Link
            href="/dashboard/profilo"
            style={{ display: "inline-block", padding: ".6rem 1.4rem", background: GREEN, color: "#fff", borderRadius: 7, fontWeight: 600, fontSize: ".88rem", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
          >
            Carica foto profilo
          </Link>
        </div>
      </div>
    );
  }

  function updateForm(key: keyof FormState, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    setApiError(null);
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (selectedComuni.length === 0) e.comuni = "Seleziona almeno un comune";
    if (selectedTypes.length === 0) e.types = "Seleziona almeno una tipologia";
    if (!form.privacy) e.privacy = "Accetta la privacy policy per continuare";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_URL}/api/property-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          email: user?.email ?? "",
          phone: user?.phone || undefined,
          liveCountry: form.liveCountry || undefined,
          liveCity: form.liveCity || undefined,
          searchComuni: selectedComuni,
          propertyTypes: selectedTypes,
          priceMin: form.priceMin ? Number(form.priceMin) : undefined,
          priceMax: form.priceMax ? Number(form.priceMax) : undefined,
          message: form.message || undefined,
          privacyAccepted: form.privacy,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? "Errore durante l'invio della richiesta.");
      }
      const created = await res.json() as PropertyRequest;
      setRequests((prev) => [created, ...prev]);
      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Errore durante l'invio.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ liveCountry: "", liveCity: "", priceMin: "", priceMax: "", message: "", privacy: false });
    setSelectedComuni([]);
    setSelectedTypes([]);
    setErrors({});
    setApiError(null);
    setSuccess(false);
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: ".72rem", fontWeight: 700, color: MUTED,
    letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>Cerca Immobile</h1>

      {/* ── Success state ─────────────────────────────────────────────────── */}
      {success ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: ".6rem" }}>✅</div>
          <p style={{ fontWeight: 700, color: TEXT, margin: "0 0 .35rem" }}>Richiesta inviata!</p>
          <p style={{ fontSize: ".85rem", color: MUTED, margin: "0 0 1.25rem", lineHeight: 1.6 }}>
            I professionisti con immobili attivi nella zona richiesta riceveranno una notifica via email.
          </p>
          <button
            onClick={resetForm}
            style={{ fontSize: ".83rem", color: MUTED, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Invia un&apos;altra richiesta
          </button>
        </div>
      ) : (
        /* ── Form ──────────────────────────────────────────────────────────── */
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.5rem" }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Pre-filled identity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".6rem" }}>
              <div>
                <label style={labelStyle}>Nome*</label>
                <input readOnly value={user?.firstName ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
              <div>
                <label style={labelStyle}>Cognome*</label>
                <input readOnly value={user?.lastName ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".85rem" }}>
              <div>
                <label style={labelStyle}>Email*</label>
                <input readOnly value={user?.email ?? ""} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a", fontSize: ".78rem" }} />
              </div>
              <div>
                <label style={labelStyle}>Telefono</label>
                <input readOnly value={(user?.phone ?? "") || "—"} style={{ ...inputStyle(false), background: "#f5f5f5", color: "#5a5a5a" }} />
              </div>
            </div>

            {/* Where do you live */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={labelStyle}>Da dove sei?</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                <input
                  type="text"
                  placeholder="es. Francia"
                  value={form.liveCountry}
                  onChange={(e) => updateForm("liveCountry", e.target.value)}
                  onFocus={() => setFocused("liveCountry")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === "liveCountry")}
                />
                <input
                  type="text"
                  placeholder="es. Parigi"
                  value={form.liveCity}
                  onChange={(e) => updateForm("liveCity", e.target.value)}
                  onFocus={() => setFocused("liveCity")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === "liveCity")}
                />
              </div>
            </div>

            {/* Comuni di interesse */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={labelStyle}>Comuni di interesse*</label>
              <ComuniSelect
                selected={selectedComuni}
                onChange={(v) => { setSelectedComuni(v); if (errors.comuni) setErrors((e) => { const n = { ...e }; delete n.comuni; return n; }); }}
                error={errors.comuni}
              />
            </div>

            {/* Tipologie */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={labelStyle}>Tipologie di immobile*</label>
              <TipologieSelect
                selected={selectedTypes}
                onChange={(v) => { setSelectedTypes(v); if (errors.types) setErrors((e) => { const n = { ...e }; delete n.types; return n; }); }}
                error={errors.types}
              />
            </div>

            {/* Budget */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={labelStyle}>Budget (€, IVA inclusa)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                <input
                  type="number"
                  min={0}
                  placeholder="Min (es. 100000)"
                  value={form.priceMin}
                  onChange={(e) => updateForm("priceMin", e.target.value)}
                  onFocus={() => setFocused("priceMin")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === "priceMin")}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Max (es. 500000)"
                  value={form.priceMax}
                  onChange={(e) => updateForm("priceMax", e.target.value)}
                  onFocus={() => setFocused("priceMax")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === "priceMax")}
                />
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: ".85rem" }}>
              <label style={labelStyle}>Messaggio</label>
              <textarea
                rows={3}
                placeholder="Descrivi cosa stai cercando (facoltativo)..."
                value={form.message}
                onChange={(e) => updateForm("message", e.target.value)}
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused(null)}
                style={{ ...inputStyle(focused === "message"), resize: "vertical" }}
              />
            </div>

            {/* Privacy */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: ".5rem", cursor: "pointer", fontSize: ".8rem", color: TEXT_SOFT, lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={form.privacy}
                  onChange={(e) => updateForm("privacy", e.target.checked)}
                  style={{ accentColor: GREEN, width: 15, height: 15, cursor: "pointer", marginTop: ".15rem", flexShrink: 0 }}
                />
                <span>
                  Accetto la{" "}
                  <Link href="/privacy-policy" style={{ color: GREEN, textDecoration: "none" }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.privacy && <p style={{ fontSize: ".7rem", color: "#dc2626", margin: ".2rem 0 0" }}>{errors.privacy}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <div style={{ padding: ".6rem .75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: ".78rem", color: "#dc2626", marginBottom: ".75rem" }}>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: ".75rem",
                background: loading ? "#9ca3af" : GREEN,
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: ".9rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GREEN_DARK; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = loading ? "#9ca3af" : GREEN; }}
            >
              {loading ? "Invio in corso..." : "Invia richiesta"}
            </button>
          </form>
        </div>
      )}

      {/* ── Requests list ─────────────────────────────────────────────────── */}
      {requestsLoaded && requests.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Le mie richieste</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {requests.map((req) => (
              <div key={req.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                    {req.propertyTypes.map((t) => (
                      <span key={t} style={{ background: GREEN_LIGHT, color: GREEN, fontSize: ".72rem", fontWeight: 700, padding: ".15rem .45rem", borderRadius: 3 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <span style={{ fontSize: ".72rem", color: MUTED }}>{relativeDate(req.createdAt)}</span>
                    <span style={{ fontSize: ".68rem", fontWeight: 700, background: "#fef9c3", color: "#854d0e", padding: ".15rem .45rem", borderRadius: 3, textTransform: "uppercase" as const, letterSpacing: ".04em" }}>
                      In elaborazione
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginBottom: ".4rem" }}>
                  {req.searchComuni.map((c) => (
                    <span key={c} style={{ background: "#f5f5f5", color: MUTED, fontSize: ".72rem", fontWeight: 600, padding: ".15rem .45rem", borderRadius: 3 }}>📍 {c}</span>
                  ))}
                </div>
                {(req.priceMin != null || req.priceMax != null) && (
                  <p style={{ fontSize: ".78rem", color: MUTED, margin: 0 }}>
                    Budget:{" "}
                    {req.priceMin != null && req.priceMax != null
                      ? `€${req.priceMin.toLocaleString("it-IT")} – €${req.priceMax.toLocaleString("it-IT")}`
                      : req.priceMin != null
                      ? `da €${req.priceMin.toLocaleString("it-IT")}`
                      : `fino a €${req.priceMax!.toLocaleString("it-IT")}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
