"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

// ── SVG Donut Chart (shared logic) ────────────────────────────────────────────
type DonutSegment = { label: string; value: number; color: string };

function DonutChart({ title, segments }: { title: string; segments: DonutSegment[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 38;
  const stroke = 14;
  const circ = 2 * Math.PI * r;

  const segsWithOffset = segments.reduce<Array<DonutSegment & { start: number; pct: number }>>((acc, seg) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].start + acc[acc.length - 1].pct : 0;
    const pct = total > 0 ? seg.value / total : 0;
    return [...acc, { ...seg, start: prev, pct }];
  }, []);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#5a5a5a", marginBottom: ".75rem" }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {total === 0 ? (
              <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            ) : (
              segsWithOffset.map((seg, i) => (
                <circle
                  key={i} cx="50" cy="50" r={r}
                  fill="none" stroke={seg.color} strokeWidth={stroke}
                  strokeDasharray={`${seg.pct * circ} ${(1 - seg.pct) * circ}`}
                  strokeDashoffset={-(seg.start * circ)}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
                />
              ))
            )}
            <circle cx="50" cy="50" r={r - stroke / 2 - 2} fill="#ffffff" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {segsWithOffset.map((seg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".3rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: ".72rem", color: LABEL, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.label}</span>
              <span style={{ fontSize: ".72rem", color: "#5a5a5a", flexShrink: 0 }}>{Math.round(seg.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mock agent data ───────────────────────────────────────────────────────────
const MOCK_AGENTS: Record<string, {
  nome: string; cognome: string; badge: boolean; ruolo: string;
  agenzia: string; agenziaSlug: string; comune: string; regione: string;
  licenza: string; piva: string; bio: string;
  tel: string; email: string; nAnnunci: number; nRecensioni: number; rating: number;
  chartTipo: DonutSegment[]; chartStato: DonutSegment[]; chartComuni: DonutSegment[];
}> = {
  "marco-bianchi": {
    nome: "Marco", cognome: "Bianchi", badge: true, ruolo: "Agente",
    agenzia: "Rurale Toscana", agenziaSlug: "rurale-toscana",
    comune: "Siena", regione: "Toscana",
    licenza: "FIAIP-2019-SI-0188", piva: "IT 01234560521",
    bio: "Agente immobiliare specializzato in casali e ville di campagna nel territorio senese. Oltre 10 anni di esperienza nel mercato rurale toscano. Collaboro con acquirenti italiani e internazionali per trovare proprietà di pregio in zone di alto valore paesaggistico.",
    tel: "+39 335 1234567", email: "m.bianchi@rurale-toscana.it",
    nAnnunci: 18, nRecensioni: 14, rating: 4.9,
    chartTipo: [
      { label: "Casali", value: 9, color: GREEN },
      { label: "Ville", value: 6, color: "#0ea5e9" },
      { label: "Terreni", value: 3, color: "#f59e0b" },
    ],
    chartStato: [
      { label: "In vendita", value: 15, color: GREEN },
      { label: "In affitto", value: 3, color: "#0ea5e9" },
    ],
    chartComuni: [
      { label: "Siena", value: 7, color: GREEN },
      { label: "Montalcino", value: 5, color: "#0ea5e9" },
      { label: "Montepulciano", value: 4, color: "#f59e0b" },
      { label: "Altri", value: 2, color: "#e5e7eb" },
    ],
  },
  default: {
    nome: "Agente", cognome: "Demo", badge: false, ruolo: "Agente",
    agenzia: "Agenzia Demo", agenziaSlug: "agenzia-demo",
    comune: "Firenze", regione: "Toscana",
    licenza: "FIAIP-0000-FI-0001", piva: "IT 00000000000",
    bio: "Agente specializzato in immobili rurali.",
    tel: "+39 333 0000000", email: "agente@demo.it",
    nAnnunci: 3, nRecensioni: 0, rating: 0,
    chartTipo: [{ label: "Casali", value: 3, color: GREEN }],
    chartStato: [{ label: "In vendita", value: 3, color: GREEN }],
    chartComuni: [{ label: "Firenze", value: 3, color: GREEN }],
  },
};

const MOCK_LISTINGS = [
  { id: "1", title: "Casale 200 m² con vigna", prezzo: "€ 480.000", tipo: "Casale", comune: "Siena", mq: 200, ipp: true },
  { id: "2", title: "Villa panoramica con piscina", prezzo: "€ 720.000", tipo: "Villa", comune: "Montalcino", mq: 340, ipp: false },
  { id: "3", title: "Terreno agricolo 5 ha", prezzo: "€ 95.000", tipo: "Terreno", comune: "Montepulciano", mq: 50000, ipp: false },
];

type PortfolioData = {
  profileId: string;
  byType: DonutSegment[];
  byListingType: DonutSegment[];
  byComune: DonutSegment[];
  total: number;
} | null;

type Tab = "annunci" | "recensioni";

export default function AgentProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const agent = MOCK_AGENTS[slug] ?? MOCK_AGENTS["default"];
  const [tab, setTab] = useState<Tab>("annunci");
  const [portfolio, setPortfolio] = useState<PortfolioData>(null);

  useEffect(() => {
    if (!slug) return;
    // Fetch real portfolio data for donut charts
    fetch(`${API_URL}/api/stats/portfolio?profileType=agent&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: PortfolioData | null) => { if (d) setPortfolio(d); })
      .catch(() => {});

    // Record profile view (fire-and-forget)
    fetch(`${API_URL}/api/stats/profile-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, profileType: "agent" }),
    }).catch(() => {});
  }, [slug]);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero dark ── */}
        <section style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #1a2a4a 100%)", padding: "3.5rem 3rem 2.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#1d4ed8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, flexShrink: 0, border: "3px solid rgba(255,255,255,.2)" }}>
                {agent.nome[0]}{agent.cognome[0]}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap", marginBottom: ".4rem" }}>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-.02em" }}>
                    {agent.nome} {agent.cognome}
                  </h1>
                  {agent.badge && (
                    <span style={{ fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".2rem .55rem", borderRadius: 5 }}>
                      ✓ VERIFICATO
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", marginBottom: ".6rem" }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 600, background: "rgba(38,165,91,.25)", color: "#4ade80", padding: ".2rem .55rem", borderRadius: 5 }}>
                    {agent.ruolo}
                  </span>
                  <span style={{ fontSize: ".8rem", color: "rgba(255,255,255,.6)" }}>·</span>
                  <Link href={`/agenzie/${agent.agenziaSlug}`} style={{ fontSize: ".82rem", color: "rgba(255,255,255,.75)", textDecoration: "none" }}>
                    🏢 {agent.agenzia}
                  </Link>
                  <span style={{ fontSize: ".8rem", color: "rgba(255,255,255,.6)" }}>·</span>
                  <span style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)" }}>{agent.comune}, {agent.regione}</span>
                </div>
                {agent.rating > 0 && (
                  <button style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 6, padding: ".3rem .7rem", color: "#fff", fontSize: ".78rem", cursor: "pointer" }}>
                    ★ {agent.rating.toFixed(1)} · Vedi Recensioni ({agent.nRecensioni})
                  </button>
                )}
              </div>

              {/* Contact buttons */}
              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                {[
                  { label: "Invia email", href: `mailto:${agent.email}` },
                  { label: "Chiama", href: `tel:${agent.tel}` },
                  { label: "Chat live", href: "#chat" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    style={{
                      padding: ".55rem 1.1rem", borderRadius: 7,
                      background: label === "Chat live" ? GREEN : "transparent",
                      border: `1.5px solid ${label === "Chat live" ? GREEN : "rgba(255,255,255,.4)"}`,
                      color: "#ffffff", fontSize: ".85rem", fontWeight: 600,
                      textDecoration: "none", whiteSpace: "nowrap",
                      transition: "background .2s, border-color .2s",
                    }}
                    onMouseEnter={(e) => {
                      if (label === "Chat live") e.currentTarget.style.backgroundColor = "#1d8a4b";
                      else { e.currentTarget.style.backgroundColor = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "#fff"; }
                    }}
                    onMouseLeave={(e) => {
                      if (label === "Chat live") e.currentTarget.style.backgroundColor = GREEN;
                      else { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; }
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <div style={{ background: "#f5f5f5" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 3rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "flex-start" }} className="profile-grid">

            {/* ── Left column ── */}
            <div>
              {/* Info bar */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "N° Licenza", value: agent.licenza },
                  { label: "P.IVA", value: agent.piva },
                  { label: "Comune", value: `${agent.comune}, ${agent.regione}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#5a5a5a", marginBottom: ".2rem" }}>{label}</div>
                    <div style={{ fontSize: ".85rem", color: TEXT, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* 3 Donut Charts */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 1.25rem" }}>
                  Portfolio — distribuzione
                  {portfolio && <span style={{ fontSize: ".75rem", fontWeight: 400, color: "#5a5a5a", marginLeft: ".5rem" }}>({portfolio.total} annunci)</span>}
                </h3>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  <DonutChart title="Tipologie" segments={portfolio?.byType ?? agent.chartTipo} />
                  <div style={{ width: 1, background: BORDER, flexShrink: 0 }} className="chart-divider" />
                  <DonutChart title="Stato" segments={portfolio?.byListingType ?? agent.chartStato} />
                  <div style={{ width: 1, background: BORDER, flexShrink: 0 }} className="chart-divider" />
                  <DonutChart title="Comuni" segments={portfolio?.byComune ?? agent.chartComuni} />
                </div>
              </div>

              {/* Tabs */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                  {([
                    { key: "annunci", label: `Annunci (${agent.nAnnunci})` },
                    { key: "recensioni", label: `Recensioni (${agent.nRecensioni})` },
                  ] as Array<{ key: Tab; label: string }>).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      style={{
                        flex: 1, padding: ".9rem .5rem",
                        background: "transparent", border: "none",
                        fontSize: ".85rem", fontWeight: tab === key ? 700 : 500,
                        color: tab === key ? GREEN : "#5a5a5a",
                        borderBottom: tab === key ? `2px solid ${GREEN}` : "2px solid transparent",
                        cursor: "pointer", transition: "color .2s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: "1.25rem" }}>
                  {tab === "annunci" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                      {MOCK_LISTINGS.map((l) => (
                        <div key={l.id} style={{ display: "flex", gap: "1rem", padding: ".85rem", borderRadius: 10, border: `1px solid ${BORDER}`, alignItems: "center" }}>
                          <div style={{ width: 72, height: 54, borderRadius: 6, background: "#e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏡</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".2rem" }}>
                              <span style={{ fontWeight: 600, fontSize: ".88rem", color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
                              {l.ipp && <span style={{ fontSize: ".62rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".1rem .35rem", borderRadius: 4, flexShrink: 0 }}>IPP</span>}
                            </div>
                            <div style={{ fontSize: ".75rem", color: "#5a5a5a" }}>{l.tipo} · {l.comune} · {l.mq.toLocaleString("it-IT")} m²</div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: ".9rem", color: TEXT, flexShrink: 0 }}>{l.prezzo}</div>
                        </div>
                      ))}
                      <div style={{ textAlign: "center", paddingTop: ".5rem" }}>
                        <Link href={`/cerca?agente=${slug}`} style={{ fontSize: ".82rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}>
                          Vedi tutti gli annunci →
                        </Link>
                      </div>
                    </div>
                  )}

                  {tab === "recensioni" && (
                    <div style={{ textAlign: "center", padding: "2rem 0", color: "#5a5a5a", fontSize: ".88rem" }}>
                      {agent.nRecensioni === 0 ? "Nessuna recensione ancora." : `${agent.nRecensioni} recensioni — media ★ ${agent.rating.toFixed(1)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div>
              {/* Bio */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .75rem" }}>Profilo</h3>
                <p style={{ fontSize: ".85rem", color: LABEL, lineHeight: 1.75, margin: 0 }}>{agent.bio}</p>
              </div>

              {/* Contact details */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem" }}>
                <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Contatti</h3>
                {[
                  { icon: "📞", label: "Telefono", value: agent.tel, href: `tel:${agent.tel}` },
                  { icon: "✉️", label: "E-mail", value: agent.email, href: `mailto:${agent.email}` },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginBottom: ".75rem" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: ".05rem" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
                      <a href={href} style={{ fontSize: ".82rem", color: GREEN, textDecoration: "none" }}>{value}</a>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: ".85rem", marginTop: ".25rem" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".4rem" }}>Agenzia</div>
                  <Link href={`/agenzie/${agent.agenziaSlug}`} style={{ fontSize: ".85rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}>
                    🏢 {agent.agenzia} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .chart-divider { display: none !important; }
        }
      `}</style>
    </>
  );
}
