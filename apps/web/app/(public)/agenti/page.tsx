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

// ── Types ─────────────────────────────────────────────────────────────────────
type Agent = {
  id: string;
  slug: string;
  nome: string;
  cognome: string;
  badge: boolean;
  visite: number;
  ruolo: "Agente" | "Broker" | "Collaboratore";
  agenzia: string;
  agenziaSlug: string;
  comune: string;
  regione: string;
  nAnnunci: number;
  tel: string;
  email: string;
  avatar: string;
};

const COMUNI = [
  "Siena","Firenze","Grosseto","Arezzo","Perugia","Terni","Viterbo","Roma",
  "Napoli","Matera","Potenza","Salerno","Palermo","Catania","Bari","Lecce",
];

const RUOLI: Agent["ruolo"][] = ["Agente", "Broker", "Collaboratore"];

const MOCK: Agent[] = [
  { id:"1", slug:"marco-bianchi", nome:"Marco", cognome:"Bianchi", badge:true, visite:3200, ruolo:"Agente", agenzia:"Rurale Toscana", agenziaSlug:"rurale-toscana", comune:"Siena", regione:"Toscana", nAnnunci:18, tel:"+39 335 1234567", email:"m.bianchi@rurale-toscana.it", avatar:"MB" },
  { id:"2", slug:"laura-ferrari", nome:"Laura", cognome:"Ferrari", badge:true, visite:2900, ruolo:"Broker", agenzia:"Verde Umbria Immobili", agenziaSlug:"verde-umbria", comune:"Perugia", regione:"Umbria", nAnnunci:14, tel:"+39 347 9876543", email:"l.ferrari@verdeumbria.it", avatar:"LF" },
  { id:"3", slug:"antonio-rossi", nome:"Antonio", cognome:"Rossi", badge:true, visite:2400, ruolo:"Agente", agenzia:"Campagna Viterbese", agenziaSlug:"campagna-viterbese", comune:"Viterbo", regione:"Lazio", nAnnunci:11, tel:"+39 329 4455667", email:"a.rossi@campagnaviterbese.it", avatar:"AR" },
  { id:"4", slug:"giulia-conti", nome:"Giulia", cognome:"Conti", badge:true, visite:2100, ruolo:"Broker", agenzia:"Maremma Case", agenziaSlug:"maremma-case", comune:"Grosseto", regione:"Toscana", nAnnunci:9, tel:"+39 338 7788990", email:"g.conti@maremmacase.it", avatar:"GC" },
  { id:"5", slug:"luca-moretti", nome:"Luca", cognome:"Moretti", badge:false, visite:1800, ruolo:"Agente", agenzia:"Basilicata Rural Estate", agenziaSlug:"basilicata-rural", comune:"Matera", regione:"Basilicata", nAnnunci:8, tel:"+39 340 2233445", email:"l.moretti@basilicatarural.it", avatar:"LM" },
  { id:"6", slug:"sofia-ricci", nome:"Sofia", cognome:"Ricci", badge:false, visite:1500, ruolo:"Collaboratore", agenzia:"Terra Aretina", agenziaSlug:"terra-aretina", comune:"Arezzo", regione:"Toscana", nAnnunci:7, tel:"+39 331 6677889", email:"s.ricci@terraaretina.it", avatar:"SR" },
  { id:"7", slug:"davide-martini", nome:"Davide", cognome:"Martini", badge:false, visite:1200, ruolo:"Agente", agenzia:"Casali Romani", agenziaSlug:"casali-romani", comune:"Roma", regione:"Lazio", nAnnunci:6, tel:"+39 320 9900112", email:"d.martini@casaliromani.it", avatar:"DM" },
  { id:"8", slug:"elena-greco", nome:"Elena", cognome:"Greco", badge:false, visite:980, ruolo:"Broker", agenzia:"Puglia Masserie", agenziaSlug:"puglia-masserie", comune:"Bari", regione:"Puglia", nAnnunci:5, tel:"+39 348 1122334", email:"e.greco@pugliamasserie.it", avatar:"EG" },
  { id:"9", slug:"matteo-lombardi", nome:"Matteo", cognome:"Lombardi", badge:false, visite:820, ruolo:"Agente", agenzia:"Natura Campana", agenziaSlug:"natura-campana", comune:"Salerno", regione:"Campania", nAnnunci:4, tel:"+39 366 5566778", email:"m.lombardi@naturacampana.it", avatar:"ML" },
  { id:"10", slug:"chiara-de-luca", nome:"Chiara", cognome:"De Luca", badge:false, visite:690, ruolo:"Collaboratore", agenzia:"Salento Verde", agenziaSlug:"salento-verde", comune:"Lecce", regione:"Puglia", nAnnunci:3, tel:"+39 355 8899001", email:"c.deluca@salentoverde.it", avatar:"CD" },
];

const PAGE_SIZE = 9;

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: Agent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: "#ffffff", border: `1px solid ${hovered ? GREEN : BORDER}`,
        borderRadius: 12, padding: "1.25rem", transition: "border-color .2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".75rem" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#1d4ed8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".85rem", flexShrink: 0 }}>
          {agent.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>
              {agent.nome} {agent.cognome}
            </span>
            {agent.badge && (
              <span style={{ fontSize: ".65rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".15rem .45rem", borderRadius: 4, flexShrink: 0 }}>
                ✓ VERIFICATO
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: ".4rem", alignItems: "center", marginTop: ".15rem" }}>
            <span style={{ fontSize: ".72rem", fontWeight: 600, color: GREEN, background: "#f0fbf5", padding: ".1rem .4rem", borderRadius: 4 }}>
              {agent.ruolo}
            </span>
            <span style={{ fontSize: ".72rem", color: "#5a5a5a" }}>·</span>
            <span style={{ fontSize: ".72rem", color: "#5a5a5a" }}>{agent.comune}</span>
          </div>
        </div>
      </div>

      {/* Agenzia */}
      <Link
        href={`/agenzie/${agent.agenziaSlug}`}
        style={{ display: "block", fontSize: ".78rem", color: GREEN, textDecoration: "none", marginBottom: ".6rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        🏢 {agent.agenzia}
      </Link>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", borderTop: `1px solid ${BORDER}`, paddingTop: ".65rem", marginBottom: ".75rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: ".95rem", color: TEXT }}>{agent.nAnnunci}</div>
          <div style={{ fontSize: ".7rem", color: "#5a5a5a" }}>Annunci</div>
        </div>
      </div>

      {/* Contact actions */}
      <div style={{ display: "flex", gap: ".5rem" }}>
        <a href={`tel:${agent.tel}`} title="Chiama"
          style={{ flex: 1, textAlign: "center", padding: ".5rem", borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: ".8rem", color: LABEL, textDecoration: "none", transition: "border-color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
        >
          📞
        </a>
        <a href={`mailto:${agent.email}`} title="Email"
          style={{ flex: 1, textAlign: "center", padding: ".5rem", borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: ".8rem", color: LABEL, textDecoration: "none", transition: "border-color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
        >
          ✉️
        </a>
        <Link
          href={`/agenti/${agent.slug}`}
          style={{ flex: 2, textAlign: "center", padding: ".5rem .75rem", borderRadius: 7, background: hovered ? GREEN : "transparent", border: `1.5px solid ${hovered ? GREEN : BORDER}`, fontSize: ".8rem", fontWeight: 600, color: hovered ? "#fff" : LABEL, textDecoration: "none", transition: "background .2s, border-color .2s, color .2s", whiteSpace: "nowrap" }}
        >
          Vedi Profilo
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentiArchivePage() {
  const [search, setSearch] = useState("");
  const [ruoloFilter, setRuoloFilter] = useState<string>("");
  const [comuneFilter, setComuneFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) setVisibleCount((n) => Math.min(n + PAGE_SIZE, MOCK.length));
  }, [inView]);

  const filtered = MOCK.filter((a) => {
    if (search && !`${a.nome} ${a.cognome}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (ruoloFilter && a.ruolo !== ruoloFilter) return false;
    if (comuneFilter && a.comune !== comuneFilter) return false;
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
      appearance: "none" as const,
    };
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72, minHeight: "100vh", background: BG }}>
        <div style={{ background: "#ffffff", borderBottom: `1px solid ${BORDER}`, padding: "2rem 3rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, margin: "0 0 .35rem", letterSpacing: "-.02em" }}>
              Agenti
            </h1>
            <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
              Agenti, broker e collaboratori specializzati in immobili rurali
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

              <div style={{ marginBottom: ".85rem" }}>
                <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>Nome agente</label>
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

              <div style={{ marginBottom: ".85rem" }}>
                <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>Ruolo</label>
                <select
                  value={ruoloFilter}
                  onChange={(e) => setRuoloFilter(e.target.value)}
                  onFocus={() => setFocusedField("ruolo")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle(focusedField === "ruolo")}
                >
                  <option value="">Tutti i ruoli</option>
                  {RUOLI.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: ".85rem" }}>
                <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>Comune</label>
                <select
                  value={comuneFilter}
                  onChange={(e) => setComuneFilter(e.target.value)}
                  onFocus={() => setFocusedField("comune")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle(focusedField === "comune")}
                >
                  <option value="">Tutti i comuni</option>
                  {COMUNI.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {(search || ruoloFilter || comuneFilter) && (
                <button
                  onClick={() => { setSearch(""); setRuoloFilter(""); setComuneFilter(""); }}
                  style={{ width: "100%", padding: ".5rem", borderRadius: 7, border: `1.5px solid ${BORDER}`, background: "transparent", fontSize: ".8rem", color: "#5a5a5a", cursor: "pointer" }}
                >
                  Reimposta filtri
                </button>
              )}
            </div>
          </aside>

          {/* ── Results ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "1rem", fontSize: ".85rem", color: "#5a5a5a" }}>
              {filtered.length} {filtered.length === 1 ? "agente trovato" : "agenti trovati"}
            </div>

            {visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#5a5a5a" }}>
                Nessun agente corrisponde ai filtri selezionati.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {visible.map((a) => <AgentCard key={a.id} agent={a} />)}
              </div>
            )}

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
