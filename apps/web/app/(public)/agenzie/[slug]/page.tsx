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

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
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
                  key={i}
                  cx="50" cy="50" r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
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

// ── Mock agency data ───────────────────────────────────────────────────────────
const MOCK_AGENCIES: Record<string, {
  nome: string; badge: boolean; comune: string; regione: string; licenza: string; piva: string;
  aree: string[]; lingue: string[]; bio: string; tel: string; cell: string; email: string;
  sito: string; nAnnunci: number; nAgenti: number; nRecensioni: number; rating: number;
  chartTipo: DonutSegment[]; chartStato: DonutSegment[]; chartComuni: DonutSegment[];
  agenti: Array<{ nome: string; ruolo: string; avatar: string; slug: string }>;
}> = {
  "rurale-toscana": {
    nome: "Rurale Toscana", badge: true, comune: "Siena", regione: "Toscana",
    licenza: "LIC-2021-SI-0042", piva: "IT 04512300520",
    aree: ["Siena","Arezzo","Grosseto","Pisa"],
    lingue: ["Italiano","English","Deutsch"],
    bio: "Rurale Toscana è un'agenzia specializzata nella compravendita e locazione di immobili rurali in tutta la Toscana. Dal 2012 operiamo con trasparenza, professionalità e profonda conoscenza del territorio, aiutando privati e investitori nazionali e internazionali a trovare la loro proprietà ideale nel cuore della campagna italiana.",
    tel: "+39 0577 123456", cell: "+39 335 9988776", email: "info@rurale-toscana.it",
    sito: "www.rurale-toscana.it", nAnnunci: 34, nAgenti: 6, nRecensioni: 28, rating: 4.8,
    chartTipo: [
      { label: "Casali", value: 14, color: GREEN },
      { label: "Ville", value: 10, color: "#0ea5e9" },
      { label: "Agriturismi", value: 6, color: "#f59e0b" },
      { label: "Terreni", value: 4, color: "#8b5cf6" },
    ],
    chartStato: [
      { label: "In vendita", value: 28, color: GREEN },
      { label: "In affitto", value: 6, color: "#0ea5e9" },
    ],
    chartComuni: [
      { label: "Siena", value: 12, color: GREEN },
      { label: "Montalcino", value: 8, color: "#0ea5e9" },
      { label: "Montepulciano", value: 7, color: "#f59e0b" },
      { label: "Altri", value: 7, color: "#e5e7eb" },
    ],
    agenti: [
      { nome: "Marco Bianchi", ruolo: "Agente", avatar: "MB", slug: "marco-bianchi" },
      { nome: "Giulia Conti", ruolo: "Broker", avatar: "GC", slug: "giulia-conti" },
      { nome: "Stefano Verde", ruolo: "Collaboratore", avatar: "SV", slug: "stefano-verde" },
    ],
  },
  default: {
    nome: "Agenzia Rurale", badge: false, comune: "Firenze", regione: "Toscana",
    licenza: "LIC-2023-FI-0001", piva: "IT 00000000000",
    aree: ["Firenze"], lingue: ["Italiano"],
    bio: "Agenzia specializzata in immobili rurali.", tel: "+39 055 000000", cell: "+39 333 0000000",
    email: "info@agenzia.it", sito: "www.agenzia.it", nAnnunci: 5, nAgenti: 1, nRecensioni: 0, rating: 0,
    chartTipo: [{ label: "Casali", value: 5, color: GREEN }],
    chartStato: [{ label: "In vendita", value: 5, color: GREEN }],
    chartComuni: [{ label: "Firenze", value: 5, color: GREEN }],
    agenti: [],
  },
};

const MOCK_LISTINGS = [
  { id: "1", title: "Casale con vigneto in Chianti", prezzo: "€ 890.000", tipo: "Casale", comune: "Gaiole in Chianti", mq: 320, ipp: true },
  { id: "2", title: "Villa con piscina e oliveto", prezzo: "€ 1.250.000", tipo: "Villa", comune: "Montalcino", mq: 480, ipp: false },
  { id: "3", title: "Agriturismo operativo 12 camere", prezzo: "€ 2.100.000", tipo: "Agriturismo", comune: "Montepulciano", mq: 850, ipp: true },
];

type Tab = "annunci" | "agenti" | "recensioni";

type PortfolioData = {
  profileId: string;
  byType: DonutSegment[];
  byListingType: DonutSegment[];
  byComune: DonutSegment[];
  total: number;
} | null;

export default function AgenziaProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const agency = MOCK_AGENCIES[slug] ?? MOCK_AGENCIES["default"];
  const [tab, setTab] = useState<Tab>("annunci");
  const [portfolio, setPortfolio] = useState<PortfolioData>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/stats/portfolio?profileType=agency&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: PortfolioData | null) => { if (d) setPortfolio(d); })
      .catch(() => {});

    fetch(`${API_URL}/api/stats/profile-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, profileType: "agency" }),
    }).catch(() => {});
  }, [slug]);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero dark ── */}
        <section style={{ background: "linear-gradient(135deg, #0a2e1a 0%, #1a4a2a 100%)", padding: "3.5rem 3rem 2.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
              {/* Logo/Avatar */}
              <div style={{ width: 88, height: 88, borderRadius: 16, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, flexShrink: 0, border: "3px solid rgba(255,255,255,.2)" }}>
                {agency.nome.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap", marginBottom: ".4rem" }}>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-.02em" }}>
                    {agency.nome}
                  </h1>
                  {agency.badge && (
                    <span style={{ fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".2rem .55rem", borderRadius: 5 }}>
                      ✓ VERIFICATA
                    </span>
                  )}
                </div>
                <p style={{ fontSize: ".88rem", color: "rgba(255,255,255,.7)", margin: "0 0 .85rem" }}>
                  {agency.comune}, {agency.regione} · {agency.nAnnunci} annunci · {agency.nAgenti} agenti
                </p>
                {agency.rating > 0 && (
                  <button style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 6, padding: ".35rem .75rem", color: "#fff", fontSize: ".8rem", cursor: "pointer" }}>
                    ★ {agency.rating.toFixed(1)} · Vedi Recensioni ({agency.nRecensioni})
                  </button>
                )}
              </div>

              {/* Contact buttons */}
              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                {[
                  { label: "Invia email", href: `mailto:${agency.email}` },
                  { label: "Chiama", href: `tel:${agency.tel}` },
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
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 3rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "flex-start" }} className="profile-grid">

            {/* ── Left column ── */}
            <div>
              {/* Info bar */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "N° Licenza", value: agency.licenza },
                  { label: "P.IVA", value: agency.piva },
                  { label: "Aree di servizio", value: agency.aree.join(", ") },
                  { label: "Lingue", value: agency.lingue.join(", ") },
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
                  <DonutChart title="Tipologie" segments={portfolio?.byType ?? agency.chartTipo} />
                  <div style={{ width: 1, background: BORDER, flexShrink: 0 }} className="chart-divider" />
                  <DonutChart title="Stato" segments={portfolio?.byListingType ?? agency.chartStato} />
                  <div style={{ width: 1, background: BORDER, flexShrink: 0 }} className="chart-divider" />
                  <DonutChart title="Comuni" segments={portfolio?.byComune ?? agency.chartComuni} />
                </div>
              </div>

              {/* Tabs */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                  {([
                    { key: "annunci", label: `Annunci (${agency.nAnnunci})` },
                    { key: "agenti", label: `Agenti (${agency.nAgenti})` },
                    { key: "recensioni", label: `Recensioni (${agency.nRecensioni})` },
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
                            <div style={{ fontSize: ".75rem", color: "#5a5a5a" }}>{l.tipo} · {l.comune} · {l.mq} m²</div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: ".9rem", color: TEXT, flexShrink: 0 }}>{l.prezzo}</div>
                        </div>
                      ))}
                      <div style={{ textAlign: "center", paddingTop: ".5rem" }}>
                        <Link href={`/cerca?agenzia=${slug}`} style={{ fontSize: ".82rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}>
                          Vedi tutti gli annunci →
                        </Link>
                      </div>
                    </div>
                  )}

                  {tab === "agenti" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                      {agency.agenti.map((ag) => (
                        <div key={ag.slug} style={{ display: "flex", alignItems: "center", gap: ".85rem", padding: ".75rem", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1d4ed8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".8rem", flexShrink: 0 }}>
                            {ag.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: ".88rem", color: TEXT }}>{ag.nome}</div>
                            <div style={{ fontSize: ".75rem", color: "#5a5a5a" }}>{ag.ruolo}</div>
                          </div>
                          <Link href={`/agenti/${ag.slug}`} style={{ fontSize: ".78rem", color: GREEN, textDecoration: "none", fontWeight: 600 }}>Profilo →</Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "recensioni" && (
                    <div style={{ textAlign: "center", padding: "2rem 0", color: "#5a5a5a", fontSize: ".88rem" }}>
                      {agency.nRecensioni === 0 ? "Nessuna recensione ancora." : `${agency.nRecensioni} recensioni — media ★ ${agency.rating.toFixed(1)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column: contacts ── */}
            <div>
              {/* Bio */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .75rem" }}>Chi siamo — {agency.nome}</h3>
                <p style={{ fontSize: ".85rem", color: LABEL, lineHeight: 1.75, margin: 0 }}>{agency.bio}</p>
              </div>

              {/* Contact details */}
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.25rem" }}>
                <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Contatti</h3>
                {[
                  { icon: "🏢", label: "Ufficio", value: agency.tel, href: `tel:${agency.tel}` },
                  { icon: "📱", label: "Cellulare", value: agency.cell, href: `tel:${agency.cell}` },
                  { icon: "✉️", label: "E-mail", value: agency.email, href: `mailto:${agency.email}` },
                  { icon: "🌐", label: "Sito web", value: agency.sito, href: `https://${agency.sito}` },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginBottom: ".75rem" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: ".05rem" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
                      <a href={href} target={label === "Sito web" ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontSize: ".82rem", color: GREEN, textDecoration: "none" }}>{value}</a>
                    </div>
                  </div>
                ))}
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
