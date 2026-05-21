"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

const CONNECT_FEATURES = [
  "Annunci illimitati",
  "Profilo professionale pubblico",
  "Aggiunta agenti al team",
  "Visibilità nei risultati di ricerca",
  "Raccolta recensioni verificate",
  "Strumenti CRM e messaggistica",
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
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [badge, setBadge] = useState(false);
  const [ipp, setIpp] = useState(0);

  const CONNECT_MENSILE = 29.9;
  const CONNECT_ANNUALE_MESE = CONNECT_MENSILE * 0.9; // -10%
  const CONNECT_ANNUALE_ANNO = CONNECT_MENSILE * 12 * 0.9;
  const BADGE_PRICE = 4.9;
  const IPP_PRICE = 7.9;

  const sigBase = CONNECT_MENSILE + (badge ? BADGE_PRICE : 0) + ipp * IPP_PRICE;
  const sigAnnuo = sigBase * 12 * 0.88; // -12%
  const sigAnnuoMese = sigAnnuo / 12;

  const sigCanActivate = badge || ipp > 0;

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero ── */}
        <section style={{ background: "linear-gradient(135deg, #0a2e1a 0%, #1a6638 100%)", padding: "5rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: "#4ade80", marginBottom: ".75rem" }}>
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

        {/* ── Ciclo di fatturazione (toggle condiviso) ── */}
        <section style={{ background: "#f5f5f5", padding: "2.5rem 3rem 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: ".75rem", background: "#fff", borderRadius: 10, padding: ".5rem 1rem", border: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: ".85rem", fontWeight: cycle === "MONTHLY" ? 700 : 500, color: cycle === "MONTHLY" ? TEXT : "#5a5a5a" }}>Mensile</span>
              <button
                onClick={() => setCycle((v) => v === "MONTHLY" ? "YEARLY" : "MONTHLY")}
                style={{ width: 44, height: 24, borderRadius: 12, background: cycle === "YEARLY" ? GREEN : "#D4D4D4", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", padding: 0 }}
              >
                <span style={{ position: "absolute", top: 3, left: cycle === "YEARLY" ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </button>
              <span style={{ fontSize: ".85rem", fontWeight: cycle === "YEARLY" ? 700 : 500, color: cycle === "YEARLY" ? TEXT : "#5a5a5a" }}>
                Annuale
                <span style={{ marginLeft: ".4rem", fontSize: ".7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".1rem .35rem", borderRadius: 4 }}>
                  fino a -12%
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* ── Due piani affiancati ── */}
        <section style={{ padding: "2rem 3rem 4rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="plans-grid">

            {/* ── Connect ── */}
            <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${GREEN}`, padding: "2rem", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: GREEN, marginBottom: ".35rem" }}>Annunci illimitati</p>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT, margin: "0 0 .3rem", letterSpacing: "-.01em" }}>LandRetrieve.com Connect</h2>
                <p style={{ fontSize: ".85rem", color: "#5a5a5a", margin: 0 }}>Tutto ciò di cui hai bisogno per crescere come professionista.</p>
              </div>

              {/* Prezzo */}
              <div style={{ marginBottom: "1.5rem" }}>
                {cycle === "YEARLY" ? (
                  <>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: TEXT, letterSpacing: "-.03em", lineHeight: 1 }}>
                      €{fmt(CONNECT_ANNUALE_MESE)}<span style={{ fontSize: "1rem", fontWeight: 500, color: "#5a5a5a" }}>/mese</span>
                    </div>
                    <div style={{ fontSize: ".78rem", color: "#5a5a5a", marginTop: ".3rem" }}>
                      Fatturato annualmente — €{fmt(CONNECT_ANNUALE_ANNO)}/anno IVA inclusa
                    </div>
                    <span style={{ display: "inline-block", marginTop: ".4rem", fontSize: ".7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: ".15rem .45rem", borderRadius: 4 }}>
                      -10% rispetto al mensile
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: TEXT, letterSpacing: "-.03em", lineHeight: 1 }}>
                      €{fmt(CONNECT_MENSILE)}<span style={{ fontSize: "1rem", fontWeight: 500, color: "#5a5a5a" }}>/mese</span>
                    </div>
                    <div style={{ fontSize: ".78rem", color: "#5a5a5a", marginTop: ".3rem" }}>IVA inclusa · Disdici in qualsiasi momento</div>
                  </>
                )}
              </div>

              {/* Feature list */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", flex: 1 }}>
                {CONNECT_FEATURES.map((f) => (
                  <li key={f} style={{ display: "flex", gap: ".5rem", alignItems: "center", marginBottom: ".55rem", fontSize: ".85rem", color: LABEL }}>
                    <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/registrati"
                style={{ display: "block", textAlign: "center", padding: ".8rem", borderRadius: 8, background: GREEN, color: "#fff", fontWeight: 700, fontSize: ".95rem", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
              >
                Inizia con Connect
              </Link>
            </div>

            {/* ── Signature ── */}
            <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${BORDER}`, padding: "2rem", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "#7c3aed", marginBottom: ".35rem" }}>Personalizzabile</p>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT, margin: "0 0 .3rem", letterSpacing: "-.01em" }}>LandRetrieve.com Signature</h2>
                <p style={{ fontSize: ".85rem", color: "#5a5a5a", margin: 0 }}>Connect + add-on premium. Costruisci la combinazione giusta.</p>
              </div>

              {/* Base inclusa */}
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: ".75rem 1rem", marginBottom: ".75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".85rem", color: LABEL, fontWeight: 600 }}>Piano Connect (base)</span>
                  <span style={{ fontSize: ".85rem", color: TEXT, fontWeight: 700 }}>€{fmt(CONNECT_MENSILE)}/mese</span>
                </div>
              </div>

              {/* Badge checkbox */}
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: ".75rem 1rem", marginBottom: ".75rem" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} style={{ accentColor: GREEN, width: 16, height: 16, cursor: "pointer" }} />
                    <div>
                      <div style={{ fontSize: ".85rem", fontWeight: 600, color: LABEL }}>Badge Verificato</div>
                      <div style={{ fontSize: ".7rem", color: "#5a5a5a" }}>Sigillo di fiducia professionale</div>
                    </div>
                  </div>
                  <span style={{ fontSize: ".82rem", color: GREEN, fontWeight: 700 }}>+€{fmt(BADGE_PRICE)}/mese</span>
                </label>
              </div>

              {/* IPP counter */}
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: ".75rem 1rem", marginBottom: "1.25rem", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: ".85rem", fontWeight: 600, color: LABEL }}>Immobili In Primo Piano</div>
                    <div style={{ fontSize: ".7rem", color: "#5a5a5a" }}>€{fmt(IPP_PRICE)}/mese per annuncio</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                    <button
                      onClick={() => setIpp((n) => Math.max(0, n - 1))}
                      style={{ width: 30, height: 30, borderRadius: 6, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: TEXT }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                    >−</button>
                    <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700, color: TEXT }}>{ipp}</span>
                    <button
                      onClick={() => setIpp((n) => n + 1)}
                      style={{ width: 30, height: 30, borderRadius: 6, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: TEXT }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Totale */}
              <div style={{ borderTop: `1.5px solid ${BORDER}`, paddingTop: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".25rem" }}>
                  <span style={{ fontSize: ".9rem", color: LABEL, fontWeight: 600 }}>Totale mensile</span>
                  <span style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT }}>€{fmt(sigBase)}</span>
                </div>
                {cycle === "YEARLY" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: ".78rem", color: "#5a5a5a" }}>Annuale (−12%)</span>
                    <span style={{ fontSize: ".95rem", fontWeight: 700, color: GREEN }}>€{fmt(sigAnnuoMese)}/mese · €{fmt(sigAnnuo)}/anno</span>
                  </div>
                )}
                <p style={{ fontSize: ".7rem", color: "#5a5a5a", margin: ".35rem 0 0" }}>IVA inclusa</p>
              </div>

              {/* Blocco se niente selezionato */}
              {!sigCanActivate && (
                <p style={{ fontSize: ".75rem", color: "#dc2626", marginBottom: ".6rem", lineHeight: 1.5 }}>
                  Seleziona almeno <strong>Badge Verificato</strong> o <strong>1 Immobile In Primo Piano</strong> per attivare Signature.
                </p>
              )}

              <Link
                href={sigCanActivate ? "/registrati" : "#"}
                onClick={(e) => !sigCanActivate && e.preventDefault()}
                style={{
                  display: "block", textAlign: "center", padding: ".8rem", borderRadius: 8,
                  background: sigCanActivate ? GREEN : "#D4D4D4",
                  color: sigCanActivate ? "#fff" : "#9ca3af",
                  fontWeight: 700, fontSize: ".95rem", textDecoration: "none",
                  cursor: sigCanActivate ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => { if (sigCanActivate) e.currentTarget.style.backgroundColor = GREEN_DARK; }}
                onMouseLeave={(e) => { if (sigCanActivate) e.currentTarget.style.backgroundColor = GREEN; }}
              >
                Inizia con Signature
              </Link>
            </div>
          </div>
        </section>

        {/* ── Add-on ── */}
        <section style={{ padding: "4rem 3rem", background: "#ffffff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: TEXT, letterSpacing: "-.02em", margin: "0 0 .5rem" }}>
                Potenzia la tua visibilità
              </h2>
              <p style={{ fontSize: ".9rem", color: "#5a5a5a", margin: 0 }}>
                Aggiungi funzionalità premium al tuo piano.
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

        {/* ── Enterprise ── */}
        <section style={{ padding: "3.5rem 3rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, margin: "0 0 .5rem", letterSpacing: "-.02em" }}>
              Hai esigenze specifiche?
            </h2>
            <p style={{ fontSize: ".9rem", color: "#5a5a5a", lineHeight: 1.7, margin: "0 0 1.5rem" }}>
              Per gruppi immobiliari, reti di agenzie o soluzioni su misura, contatta direttamente il nostro team.
            </p>
            <Link
              href="/contatti"
              style={{ display: "inline-block", padding: ".75rem 2rem", background: TEXT, color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: ".9rem", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEXT)}
            >
              Contatta il team
            </Link>
          </div>
        </section>

        {/* ── Footer note ── */}
        <div style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "1rem 3rem", textAlign: "center" }}>
          <p style={{ fontSize: ".78rem", color: "#5a5a5a", margin: 0 }}>
            IVA inclusa · Pagamenti sicuri via Stripe · Disdici in qualsiasi momento
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .addon-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .addon-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
