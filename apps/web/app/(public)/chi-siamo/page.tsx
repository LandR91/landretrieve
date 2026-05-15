import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

export default function ChiSiamoPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 60%, #1a6638 100%)",
            padding: "5rem 3rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: ".85rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1rem" }}>
              Chi siamo
            </p>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.15,
                letterSpacing: "-.02em",
                margin: "0 0 1.25rem",
              }}
            >
              Gli immobili rurali meritano una piattaforma dedicata
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,.75)", lineHeight: 1.7, margin: 0 }}>
              Aiutare agenzie, agenti indipendenti e broker a valorizzare gli immobili rurali
              italiani connettendoli con acquirenti qualificati in tutto il mondo.
            </p>
          </div>
        </section>

        {/* ── Sezione 1: Chi siamo – missione ── */}
        <section style={{ padding: "4rem 3rem", background: "#ffffff" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }} className="chi-grid">
            <div>
              <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, marginBottom: ".75rem" }}>
                La nostra missione
              </p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, lineHeight: 1.25, letterSpacing: "-.02em", margin: "0 0 1.1rem" }}>
                Una rete professionale costruita per chi lavora nel rurale
              </h2>
              <p style={{ fontSize: ".95rem", color: LABEL, lineHeight: 1.75, marginBottom: ".85rem" }}>
                LandRetrieve.com non è un semplice portale di annunci. È una community professionale
                dove agenzie, agenti e broker si incontrano, collaborano e crescono insieme.
              </p>
              <p style={{ fontSize: ".95rem", color: LABEL, lineHeight: 1.75 }}>
                Ogni profilo è verificato. Ogni annuncio è autentico. Ogni connessione ha valore reale.
              </p>
            </div>
            <div style={{ background: "#f5f5f5", borderRadius: 16, padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: "🌿", title: "Solo immobili rurali", desc: "Ville, casali, agriturismi, aziende agricole, terreni. Nessuna distrazione." },
                { icon: "✅", title: "Professionisti verificati", desc: "Ogni agenzia e agente è verificato prima di poter pubblicare." },
                { icon: "🌍", title: "Visibilità internazionale", desc: "Raggiungi acquirenti europei e internazionali interessati al territorio italiano." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: ".85rem" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".9rem", color: TEXT, marginBottom: ".2rem" }}>{title}</div>
                    <div style={{ fontSize: ".82rem", color: "#5a5a5a", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sezione 2: La nostra storia ── */}
        <section style={{ padding: "4rem 3rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, marginBottom: ".75rem" }}>
              La nostra storia
            </p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, lineHeight: 1.25, letterSpacing: "-.02em", margin: "0 0 1.5rem" }}>
              Nati a Certaldo, nel cuore della campagna italiana
            </h2>
            <div style={{ textAlign: "left", background: "#ffffff", borderRadius: 16, padding: "2.5rem", border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: ".95rem", color: LABEL, lineHeight: 1.8, marginBottom: "1rem" }}>
                Nel 2025 nasce LandRetrieve.com. L'idea prende forma a Certaldo, nel cuore della campagna italiana,
                dove ogni collina racconta una storia e ogni podere è patrimonio da valorizzare.
              </p>
              <p style={{ fontSize: ".95rem", color: LABEL, lineHeight: 1.8, marginBottom: "1rem" }}>
                Fondatori con esperienze nel settore immobiliare e nel digitale, abbiamo vissuto in prima
                persona la difficoltà di connettere acquirenti qualificati con professionisti preparati
                nel segmento degli immobili rurali.
              </p>
              <p style={{ fontSize: ".95rem", color: LABEL, lineHeight: 1.8, margin: 0 }}>
                LandRetrieve.com nasce per colmare questo gap: una piattaforma dedicata, moderna,
                che rispetta la specificità del mercato rurale italiano e lo proietta verso il futuro.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sezione 3: Cosa puoi fare ── */}
        <section style={{ padding: "4rem 3rem", background: "#ffffff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, marginBottom: ".75rem" }}>
                Funzionalità
              </p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, lineHeight: 1.25, letterSpacing: "-.02em", margin: 0 }}>
                Cosa puoi fare con LandRetrieve.com
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }} className="features-grid">
              {[
                { icon: "📋", title: "Pubblica annunci illimitati", desc: "Carica tutti i tuoi immobili rurali con foto, dati catastali e geolocalizzazione precisa." },
                { icon: "🔍", title: "Motore di ricerca avanzato", desc: "I tuoi annunci appaiono in una ricerca dedicata con filtri specifici per il mercato rurale." },
                { icon: "👥", title: "Costruisci il tuo team", desc: "Aggiungi agenti al tuo profilo agenzia e gestisci le performance dell'intero team." },
                { icon: "💬", title: "Messaggistica integrata", desc: "Comunica con gli acquirenti direttamente in piattaforma. Nessun dato condiviso con terze parti." },
                { icon: "⭐", title: "Badge Verificato", desc: "Distinguiti con il sigillo di verifica professionale e aumenta la fiducia degli acquirenti." },
                { icon: "📈", title: "Statistiche e CRM", desc: "Monitora visite, richieste e offerte. Gestisci i lead con strumenti professionali integrati." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: "#f5f5f5", borderRadius: 12, padding: "1.5rem", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: ".75rem" }}>{icon}</div>
                  <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: TEXT, margin: "0 0 .5rem" }}>{title}</h3>
                  <p style={{ fontSize: ".82rem", color: "#5a5a5a", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sezione 4: Per chi è + Perché ── */}
        <section style={{ padding: "4rem 3rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }} className="chi-grid">
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "2rem", border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, marginBottom: ".75rem" }}>
                Per chi è
              </p>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT, margin: "0 0 1.25rem", lineHeight: 1.3 }}>
                LandRetrieve.com è pensato per te se...
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Sei un'agenzia immobiliare specializzata in rurale",
                  "Sei un agente indipendente o un broker freelance",
                  "Gestisci un portafoglio di proprietà agricole o storiche",
                  "Vuoi raggiungere acquirenti italiani e internazionali",
                  "Cerchi collaborazioni con altri professionisti del settore",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginBottom: ".65rem", fontSize: ".88rem", color: LABEL, lineHeight: 1.6 }}>
                    <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0, marginTop: ".1rem" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "2rem", border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, marginBottom: ".75rem" }}>
                Perché iscriversi oggi
              </p>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT, margin: "0 0 1.25rem", lineHeight: 1.3 }}>
                Il momento giusto è adesso
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Il mercato rurale italiano è in forte crescita internazionale",
                  "Essere tra i primi significa costruire autorità e reputazione",
                  "I profili verificati ottengono visibilità prioritaria",
                  "La piattaforma cresce con te — nessun limite di annunci",
                  "Pagamenti sicuri, disdetta in qualsiasi momento",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginBottom: ".65rem", fontSize: ".88rem", color: LABEL, lineHeight: 1.6 }}>
                    <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0, marginTop: ".1rem" }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA finale ── */}
        <section style={{ padding: "5rem 3rem", background: "linear-gradient(135deg, #0a2e1a 0%, #1a6638 100%)", textAlign: "center" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.2, letterSpacing: "-.02em", margin: "0 0 1rem" }}>
              Connetti la tua agenzia con chi può davvero farti vendere
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.75)", lineHeight: 1.7, marginBottom: "2rem" }}>
              Unisciti alla community di professionisti che stanno trasformando il mercato degli immobili rurali italiani.
            </p>
            <Link
              href="/registrati"
              style={{
                display: "inline-block",
                padding: ".9rem 2.5rem",
                background: GREEN,
                color: "#ffffff",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                transition: "background-color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
            >
              Crea il tuo profilo
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chi-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
