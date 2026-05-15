"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

const CONNECT_FEATURES = [
  "Annunci illimitati",
  "Profilo professionale pubblico",
  "Aggiunta agenti al team",
  "Visibilità nei risultati di ricerca",
  "Raccolta recensioni verificate",
  "Strumenti di collaborazione",
  "Accesso al network di professionisti",
  "Supporto via email e chat",
];

const ADDONS = [
  { icon: "⭐", title: "Immobili In Primo Piano", desc: "Porta i tuoi annunci in cima ai risultati. Massima visibilità, massimo impatto.", price: "€7,90/mese per annuncio" },
  { icon: "🏆", title: "Profilo Premium", desc: "Il tuo profilo appare in evidenza nell'archivio agenzie e agenti.", price: "Incluso nel piano Signature" },
  { icon: "🔝", title: "Priorità nella ricerca", desc: "I tuoi annunci ottengono un boost algoritmico nelle ricerche organiche.", price: "Incluso con Badge Verificato" },
  { icon: "🌍", title: "Esposizione internazionale", desc: "I tuoi annunci vengono tradotti e proposti a buyer europei e internazionali.", price: "Incluso nel piano Connect" },
];

function fmt(eur: number) {
  return eur.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PianiPage() {
  const [annuale, setAnnuale] = useState(false);
  const [sigAnnuale, setSigAnnuale] = useState(false);
  const [badge, setBadge] = useState(false);
  const [ipp, setIpp] = useState(0);

  const CONNECT_MENSILE = 29.9;
  const CONNECT_ANNUALE = CONNECT_MENSILE * 12 * 0.9; // -10%
  const BADGE_PRICE = 4.9;
  const IPP_PRICE = 7.9;
  const SIG_DISCOUNT = 0.88; // -12%

  const sigBase = badge ? BADGE_PRICE : 0;
  const sigIpp = ipp * IPP_PRICE;
  const sigMensile = CONNECT_MENSILE + sigBase + sigIpp;
  const sigAnnuo = sigMensile * 12 * SIG_DISCOUNT;

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero ── */}
        <section style={{ background: "linear-gradient(135deg, #0a2e1a 0%, #1a6638 100%)", padding: "5rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#4ade80", marginBottom: ".75rem" }}>
              Piani e prezzi
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-.02em", margin: "0 0 1.1rem" }}>
              Un&apos;unica piattaforma.<br />Infinite connessioni.
            </h1>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,.75)", lineHeight: 1.75, margin: 0 }}>
              Costruisci la tua reputazione professionale nel mercato rurale italiano.
              Un abbonamento, nessuna commissione, crescita illimitata.
            </p>
          </div>
        </section>

        {/* ── Sezione 1: Connect ── */}
        <section style={{ padding: "4rem 3rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>💎</span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, letterSpacing: "-.02em", margin: ".5rem 0 .4rem" }}>
                LandRetrieve.com Connect
              </h2>
              <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
                Tutto ciò di cui hai bisogno per costruire e far crescere la tua presenza professionale.
              </p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: 16, border: `2px solid ${GREEN}`, padding: "2.5rem", maxWidth: 560, margin: "0 auto" }}>
              {/* Toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".75rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: ".85rem", fontWeight: annuale ? 500 : 700, color: annuale ? "#5a5a5a" : TEXT }}>Mensile</span>
                <button
                  onClick={() => setAnnuale((v) => !v)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: annuale ? GREEN : "#D4D4D4",
                    border: "none", cursor: "pointer",
                    position: "relative", transition: "background .2s", padding: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3,
                    left: annuale ? "calc(100% - 21px)" : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left .2s",
                  }} />
                </button>
                <span style={{ fontSize: ".85rem", fontWeight: annuale ? 700 : 500, color: annuale ? TEXT : "#5a5a5a" }}>
                  Annuale
                  <span style={{ marginLeft: ".4rem", fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".1rem .35rem", borderRadius: 4 }}>
                    -10%
                  </span>
                </span>
              </div>

              {/* Price */}
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                {annuale ? (
                  <>
                    <div style={{ fontSize: "2.75rem", fontWeight: 800, color: TEXT, letterSpacing: "-.03em", lineHeight: 1 }}>
                      €{fmt(CONNECT_ANNUALE / 12)}<span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#5a5a5a" }}>/mese</span>
                    </div>
                    <div style={{ fontSize: ".82rem", color: "#5a5a5a", marginTop: ".35rem" }}>
                      Fatturato annualmente — €{fmt(CONNECT_ANNUALE)}/anno IVA inclusa
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "2.75rem", fontWeight: 800, color: TEXT, letterSpacing: "-.03em", lineHeight: 1 }}>
                      €{fmt(CONNECT_MENSILE)}<span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#5a5a5a" }}>/mese</span>
                    </div>
                    <div style={{ fontSize: ".82rem", color: "#5a5a5a", marginTop: ".35rem" }}>IVA inclusa · Disdici in qualsiasi momento</div>
                  </>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem" }}>
                {CONNECT_FEATURES.map((f) => (
                  <li key={f} style={{ display: "flex", gap: ".6rem", alignItems: "center", marginBottom: ".6rem", fontSize: ".88rem", color: LABEL }}>
                    <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Broker box */}
              <div style={{ background: "#f0fbf5", borderRadius: 10, padding: "1rem 1.25rem", border: `1px solid ${GREEN}40`, marginBottom: "1.5rem" }}>
                <p style={{ fontSize: ".82rem", color: LABEL, lineHeight: 1.6, margin: 0 }}>
                  <strong>Pensato anche per broker indipendenti.</strong> Nessuna agenzia di riferimento richiesta.
                  Pubblica, costruisci il tuo profilo e cresci come professionista autonomo.
                </p>
              </div>

              <Link
                href="/registrati"
                style={{
                  display: "block", textAlign: "center",
                  padding: ".85rem", borderRadius: 8,
                  background: GREEN, color: "#fff",
                  fontWeight: 700, fontSize: "1rem",
                  textDecoration: "none", transition: "background-color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
              >
                Crea il tuo profilo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Sezione 2: Add-on ── */}
        <section style={{ padding: "4rem 3rem", background: "#ffffff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: TEXT, letterSpacing: "-.02em", margin: "0 0 .5rem" }}>
                Potenzia la tua visibilità
              </h2>
              <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
                Aggiungi funzionalità premium al tuo piano Connect.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }} className="addon-grid">
              {ADDONS.map(({ icon, title, desc, price }) => (
                <div key={title} style={{ background: "#f5f5f5", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: ".6rem" }}>{icon}</div>
                  <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .5rem" }}>{title}</h3>
                  <p style={{ fontSize: ".8rem", color: "#5a5a5a", lineHeight: 1.6, margin: "0 0 .75rem" }}>{desc}</p>
                  <span style={{ fontSize: ".75rem", fontWeight: 700, color: GREEN }}>{price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sezione 3: Signature Simulator ── */}
        <section style={{ padding: "4rem 3rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🧩</span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, letterSpacing: "-.02em", margin: ".5rem 0 .4rem" }}>
                LandRetrieve.com Signature
              </h2>
              <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
                Piano personalizzato. Costruisci la combinazione giusta per la tua attività.
              </p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: 16, border: `2px solid ${BORDER}`, padding: "2.5rem" }}>
              {/* Toggle annuale */}
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "2rem" }}>
                <span style={{ fontSize: ".85rem", fontWeight: sigAnnuale ? 500 : 700, color: sigAnnuale ? "#5a5a5a" : TEXT }}>Mensile</span>
                <button
                  onClick={() => setSigAnnuale((v) => !v)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: sigAnnuale ? GREEN : "#D4D4D4", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", padding: 0 }}
                >
                  <span style={{ position: "absolute", top: 3, left: sigAnnuale ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </button>
                <span style={{ fontSize: ".85rem", fontWeight: sigAnnuale ? 700 : 500, color: sigAnnuale ? TEXT : "#5a5a5a" }}>
                  Annuale
                  <span style={{ marginLeft: ".4rem", fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".1rem .35rem", borderRadius: 4 }}>-12%</span>
                </span>
              </div>

              {/* Base (Connect included) */}
              <div style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem", background: "#f5f5f5", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".88rem", color: LABEL, fontWeight: 600 }}>Piano Connect (base inclusa)</span>
                  <span style={{ fontSize: ".88rem", color: TEXT, fontWeight: 700 }}>€{fmt(CONNECT_MENSILE)}/mese</span>
                </div>
              </div>

              {/* Badge checkbox */}
              <div style={{ marginBottom: "1rem", padding: "1rem 1.25rem", background: "#f5f5f5", borderRadius: 10 }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <input
                      type="checkbox"
                      checked={badge}
                      onChange={(e) => setBadge(e.target.checked)}
                      style={{ accentColor: GREEN, width: 18, height: 18, cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontSize: ".88rem", fontWeight: 600, color: LABEL }}>Badge Verificato</div>
                      <div style={{ fontSize: ".72rem", color: "#5a5a5a" }}>Sigillo di fiducia professionale</div>
                    </div>
                  </div>
                  <span style={{ fontSize: ".85rem", color: GREEN, fontWeight: 700 }}>+€{fmt(BADGE_PRICE)}/mese</span>
                </label>
              </div>

              {/* IPP counter */}
              <div style={{ marginBottom: "2rem", padding: "1rem 1.25rem", background: "#f5f5f5", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: LABEL }}>Immobili In Primo Piano</div>
                    <div style={{ fontSize: ".72rem", color: "#5a5a5a" }}>€{fmt(IPP_PRICE)}/mese per annuncio</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <button
                      onClick={() => setIpp((n) => Math.max(0, n - 1))}
                      style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: TEXT, transition: "border-color .2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700, fontSize: "1rem", color: TEXT }}>{ipp}</span>
                    <button
                      onClick={() => setIpp((n) => n + 1)}
                      style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: TEXT, transition: "border-color .2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic total */}
              <div style={{ borderTop: `2px solid ${BORDER}`, paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".4rem" }}>
                  <span style={{ fontSize: ".9rem", color: LABEL, fontWeight: 600 }}>Totale mensile</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: TEXT }}>€{fmt(sigMensile)}</span>
                </div>
                {sigAnnuale && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: ".82rem", color: "#5a5a5a" }}>Annuale (fatturato in un&apos;unica soluzione)</span>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: GREEN }}>€{fmt(sigAnnuo)}</span>
                  </div>
                )}
                <p style={{ fontSize: ".72rem", color: "#5a5a5a", marginTop: ".5rem" }}>IVA inclusa</p>
              </div>

              <Link
                href="/registrati"
                style={{ display: "block", textAlign: "center", padding: ".85rem", borderRadius: 8, background: GREEN, color: "#fff", fontWeight: 700, fontSize: "1rem", textDecoration: "none", transition: "background-color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
              >
                Crea il tuo profilo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Sezione 4: Enterprise ── */}
        <section style={{ padding: "3.5rem 3rem", background: "#ffffff" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, margin: "0 0 .5rem", letterSpacing: "-.02em" }}>
              Hai esigenze specifiche?
            </h2>
            <p style={{ fontSize: ".9rem", color: "#5a5a5a", lineHeight: 1.7, margin: "0 0 1.5rem" }}>
              Per gruppi immobiliari, reti di agenzie o soluzioni su misura, contatta direttamente il nostro team.
              Valutiamo ogni progetto con la massima attenzione.
            </p>
            <Link
              href="/contatti"
              style={{ display: "inline-block", padding: ".75rem 2rem", background: TEXT, color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: ".9rem", textDecoration: "none", transition: "background-color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEXT)}
            >
              Contatta il team
            </Link>
          </div>
        </section>

        {/* ── Footer note ── */}
        <div style={{ background: "#f5f5f5", borderTop: `1px solid ${BORDER}`, padding: "1rem 3rem", textAlign: "center" }}>
          <p style={{ fontSize: ".78rem", color: "#5a5a5a", margin: 0 }}>
            IVA inclusa · Pagamenti sicuri via Stripe · Disdici in qualsiasi momento
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .addon-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .addon-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
