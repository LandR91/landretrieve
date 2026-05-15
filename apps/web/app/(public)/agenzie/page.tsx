"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

// ── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";
const BG = "#f5f5f5";

// ── Mock data ─────────────────────────────────────────────────────────────────
type Agency = {
  id: string;
  slug: string;
  nome: string;
  badge: boolean;
  visite: number;
  comune: string;
  regione: string;
  nAgenti: number;
  nAnnunci: number;
  tel: string;
  email: string;
  avatar: string;
};

const COMUNI = [
  "Siena","Firenze","Grosseto","Arezzo","Perugia","Terni","Viterbo","Roma",
  "Napoli","Matera","Potenza","Salerno","Palermo","Catania","Bari","Lecce",
];

const MOCK: Agency[] = [
  { id:"1", slug:"rurale-toscana", nome:"Rurale Toscana", badge:true, visite:4820, comune:"Siena", regione:"Toscana", nAgenti:6, nAnnunci:34, tel:"+39 0577 123456", email:"info@rurale-toscana.it", avatar:"RT" },
  { id:"2", slug:"verde-umbria", nome:"Verde Umbria Immobili", badge:true, visite:3900, comune:"Perugia", regione:"Umbria", nAgenti:4, nAnnunci:27, tel:"+39 075 987654", email:"info@verdeumbria.it", avatar:"VU" },
  { id:"3", slug:"campagna-viterbese", nome:"Campagna Viterbese", badge:true, visite:3100, comune:"Viterbo", regione:"Lazio", nAgenti:3, nAnnunci:21, tel:"+39 0761 445566", email:"info@campagnaviterbese.it", avatar:"CV" },
  { id:"4", slug:"maremma-case", nome:"Maremma Case", badge:true, visite:2750, comune:"Grosseto", regione:"Toscana", nAgenti:5, nAnnunci:18, tel:"+39 0564 332211", email:"info@maremmacase.it", avatar:"MC" },
  { id:"5", slug:"basilicata-rural", nome:"Basilicata Rural Estate", badge:true, visite:2100, comune:"Matera", regione:"Basilicata", nAgenti:2, nAnnunci:15, tel:"+39 0835 778899", email:"info@basilicatarural.it", avatar:"BR" },
  { id:"6", slug:"terra-aretina", nome:"Terra Aretina", badge:false, visite:1900, comune:"Arezzo", regione:"Toscana", nAgenti:3, nAnnunci:12, tel:"+39 0575 224433", email:"info@terraaretina.it", avatar:"TA" },
  { id:"7", slug:"casali-romani", nome:"Casali Romani", badge:false, visite:1600, comune:"Roma", regione:"Lazio", nAgenti:4, nAnnunci:10, tel:"+39 06 8765432", email:"info@casaliromani.it", avatar:"CR" },
  { id:"8", slug:"puglia-masserie", nome:"Puglia Masserie", badge:false, visite:1450, comune:"Bari", regione:"Puglia", nAgenti:2, nAnnunci:9, tel:"+39 080 5544332", email:"info@pugliamasserie.it", avatar:"PM" },
  { id:"9", slug:"natura-campana", nome:"Natura Campana", badge:false, visite:1200, comune:"Salerno", regione:"Campania", nAgenti:3, nAnnunci:8, tel:"+39 089 334455", email:"info@naturacampana.it", avatar:"NC" },
  { id:"10", slug:"salento-verde", nome:"Salento Verde", badge:false, visite:980, comune:"Lecce", regione:"Puglia", nAgenti:2, nAnnunci:7, tel:"+39 0832 776655", email:"info@salentoverde.it", avatar:"SV" },
  { id:"11", slug:"sicilia-rurale", nome:"Sicilia Rurale", badge:false, visite:870, comune:"Palermo", regione:"Sicilia", nAgenti:2, nAnnunci:6, tel:"+39 091 6655443", email:"info@siciliarurale.it", avatar:"SR" },
  { id:"12", slug:"etna-estate", nome:"Etna Estate", badge:false, visite:720, comune:"Catania", regione:"Sicilia", nAgenti:1, nAnnunci:5, tel:"+39 095 7788990", email:"info@etnaestate.it", avatar:"EE" },
];

const PAGE_SIZE = 9;

// ── Agency Card ───────────────────────────────────────────────────────────────
function AgencyCard({ agency }: { agency: Agency }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${hovered ? GREEN : BORDER}`,
        borderRadius: 12,
        padding: "1.25rem",
        transition: "border-color .2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".75rem" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 10,
          background: GREEN, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: ".85rem", flexShrink: 0,
        }}>
          {agency.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {agency.nome}
            </span>
            {agency.badge && (
              <span style={{ fontSize: ".65rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".15rem .45rem", borderRadius: 4, flexShrink: 0 }}>
                ✓ VERIFICATA
              </span>
            )}
          </div>
          <span style={{ fontSize: ".78rem", color: "#5a5a5a" }}>{agency.comune}, {agency.regione}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: ".85rem", borderTop: `1px solid ${BORDER}`, paddingTop: ".75rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>{agency.nAgenti}</div>
          <div style={{ fontSize: ".7rem", color: "#5a5a5a" }}>Agenti</div>
        </div>
        <div style={{ width: 1, background: BORDER }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>{agency.nAnnunci}</div>
          <div style={{ fontSize: ".7rem", color: "#5a5a5a" }}>Annunci</div>
        </div>
      </div>

      {/* Contact */}
      <div style={{ marginBottom: ".85rem" }}>
        <a href={`tel:${agency.tel}`} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".8rem", color: LABEL, textDecoration: "none", marginBottom: ".3rem" }}>
          <span style={{ fontSize: ".9rem" }}>📞</span> {agency.tel}
        </a>
        <a href={`mailto:${agency.email}`} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".8rem", color: LABEL, textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span style={{ fontSize: ".9rem" }}>✉️</span> {agency.email}
        </a>
      </div>

      {/* CTA */}
      <Link
        href={`/agenzie/${agency.slug}`}
        style={{
          display: "block", textAlign: "center",
          padding: ".6rem", borderRadius: 7,
          background: hovered ? GREEN : "transparent",
          border: `1.5px solid ${hovered ? GREEN : BORDER}`,
          color: hovered ? "#fff" : LABEL,
          fontSize: ".85rem", fontWeight: 600,
          textDecoration: "none",
          transition: "background .2s, border-color .2s, color .2s",
        }}
      >
        Vedi Profilo
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgenzieArchivePage() {
  const [search, setSearch] = useState("");
  const [comuneFilter, setComuneFilter] = useState("");
  const [soloVerificate, setSoloVerificate] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) setVisibleCount((n) => Math.min(n + PAGE_SIZE, MOCK.length));
  }, [inView]);

  // Filter + sort
  const filtered = MOCK.filter((a) => {
    if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (comuneFilter && a.comune !== comuneFilter) return false;
    if (soloVerificate && !a.badge) return false;
    return true;
  }).sort((a, b) => {
    if (a.badge && !b.badge) return -1;
    if (!a.badge && b.badge) return 1;
    return b.visite - a.visite;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function inputStyle(focused: boolean): React.CSSProperties {
    return {
      width: "100%", padding: ".55rem .75rem",
      border: `1.5px solid ${focused ? GREEN : BORDER}`,
      borderRadius: 7, fontSize: ".85rem", color: TEXT,
      background: "#fff", outline: "none",
      transition: "border-color .2s",
      boxSizing: "border-box",
    };
  }

  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72, minHeight: "100vh", background: BG }}>
        {/* Page header */}
        <div style={{ background: "#ffffff", borderBottom: `1px solid ${BORDER}`, padding: "2rem 3rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, margin: "0 0 .35rem", letterSpacing: "-.02em" }}>
              Agenzie
            </h1>
            <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
              Professionisti verificati specializzati in immobili rurali italiani
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 3rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          {/* ── Sidebar ── */}
          <aside style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem", position: "sticky", top: 90 }}>
              <h3 style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#5a5a5a", margin: "0 0 1rem" }}>
                Filtra
              </h3>

              {/* Nome */}
              <div style={{ marginBottom: ".85rem" }}>
                <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                  Nome agenzia
                </label>
                <input
                  type="text"
                  placeholder="Cerca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setFocusedField("search")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle(focusedField === "search")}
                />
              </div>

              {/* Comune */}
              <div style={{ marginBottom: ".85rem" }}>
                <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                  Comune
                </label>
                <select
                  value={comuneFilter}
                  onChange={(e) => setComuneFilter(e.target.value)}
                  onFocus={() => setFocusedField("comune")}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle(focusedField === "comune"), appearance: "none" as const }}
                >
                  <option value="">Tutti i comuni</option>
                  {COMUNI.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Solo verificate */}
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer", fontSize: ".85rem", color: LABEL }}>
                <input
                  type="checkbox"
                  checked={soloVerificate}
                  onChange={(e) => setSoloVerificate(e.target.checked)}
                  style={{ accentColor: GREEN, width: 16, height: 16, cursor: "pointer" }}
                />
                Solo verificate
              </label>

              {/* Reset */}
              {(search || comuneFilter || soloVerificate) && (
                <button
                  onClick={() => { setSearch(""); setComuneFilter(""); setSoloVerificate(false); }}
                  style={{
                    marginTop: "1rem", width: "100%",
                    padding: ".5rem", borderRadius: 7,
                    border: `1.5px solid ${BORDER}`,
                    background: "transparent", fontSize: ".8rem",
                    color: "#5a5a5a", cursor: "pointer",
                  }}
                >
                  Reimposta filtri
                </button>
              )}
            </div>
          </aside>

          {/* ── Results ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "1rem", fontSize: ".85rem", color: "#5a5a5a" }}>
              {filtered.length} {filtered.length === 1 ? "agenzia trovata" : "agenzie trovate"}
            </div>

            {visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#5a5a5a" }}>
                Nessuna agenzia corrisponde ai filtri selezionati.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {visible.map((a) => <AgencyCard key={a.id} agency={a} />)}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
              </div>
            )}
          </main>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
