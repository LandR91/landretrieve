"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── Eyebrow label ────────────────────────────────────────────────────────────
function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      style={{
        fontSize: ".72rem",
        fontWeight: 700,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "#1a7a42",
        marginBottom: ".75rem",
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: center ? "center" : "flex-start",
      }}
    >
      {children}
      <span style={{ flex: "0 0 32px", height: 1, backgroundColor: "#1a7a42", opacity: 0.4 }} />
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(.65)",
        }}
      />
      {/* Overlay gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.5) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: 820,
          animation: "fadeUp .9s ease both",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: ".75rem",
            fontWeight: 600,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.75)",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ width: 30, height: 1, backgroundColor: "rgba(255,255,255,.4)", display: "block" }} />
          Piattaforma social-professionale
          <span style={{ width: 30, height: 1, backgroundColor: "rgba(255,255,255,.4)", display: "block" }} />
        </div>

        <h1
          style={{
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-.02em",
            lineHeight: 1.0,
            marginBottom: "1.25rem",
          }}
        >
          Casa &amp; <em style={{ fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,.85)" }}>Natura</em>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,.8)",
            lineHeight: 1.7,
            fontWeight: 300,
            marginBottom: "2.5rem",
            maxWidth: 640,
            margin: "0 auto 2.5rem",
          }}
        >
          Scopri ville, aziende agricole, agriturismi, casali e terreni in vendita. Solo buyer qualificati, solo professionisti verificati.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/cerca"
            style={{
              padding: ".9rem 2rem",
              borderRadius: 6,
              backgroundColor: "#26A55B",
              color: "#ffffff",
              fontSize: ".975rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background-color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
          >
            Cerca Immobili →
          </Link>
          <Link
            href="/registrati"
            style={{
              padding: ".9rem 2rem",
              borderRadius: 6,
              border: "1.5px solid rgba(255,255,255,.5)",
              backgroundColor: "transparent",
              color: "#ffffff",
              fontSize: ".975rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "border-color .2s, background-color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ffffff";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,.5)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Crea il tuo profilo
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,.5)",
          fontSize: ".72rem",
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        <span>Scorri</span>
        <div
          style={{
            width: 1,
            height: 40,
            backgroundColor: "rgba(255,255,255,.3)",
            animation: "scrollLine 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}

// ─── TRUST BAR ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: "✅", label: "Solo professionisti verificati" },
    { icon: "🌍", label: "Buyer nazionali e internazionali" },
    { icon: "🔒", label: "Pagamenti sicuri con Stripe" },
    { icon: "📞", label: "Supporto dedicato" },
    { icon: "🏡", label: "Solo immobili rurali" },
  ];
  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #D4D4D4",
        borderBottom: "1px solid #D4D4D4",
        padding: "1.25rem 3rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3rem",
          flexWrap: "wrap",
        }}
      >
        {items.map(({ icon, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".875rem", color: "#374151" }}>
            <span style={{ fontSize: "1rem" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONNESSIONI ──────────────────────────────────────────────────────────────
function Connessioni() {
  return (
    <section style={{ padding: "6rem 3rem", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
          className="conn-grid"
        >
          {/* Image side */}
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "4/3",
                background: "linear-gradient(135deg, #c8ecd8, #8dd4ab)",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src="/images/connessioni-rete.png"
                alt="LandRetrieve.com - Rete professionale immobiliare mondiale"
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            {/* Badge */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: ".65rem .9rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: ".8rem",
                fontWeight: 500,
                color: "#374151",
                boxShadow: "0 4px 16px rgba(0,0,0,.1)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#26A55B",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              Professionisti attivi online
            </div>
          </div>

          {/* Content side */}
          <div>
            <Eyebrow>La nostra missione</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 600, lineHeight: 1.15, marginBottom: "1rem", maxWidth: 480 }}>
              Le vendite iniziano dalle connessioni giuste
            </h2>
            <p style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.75, fontWeight: 300, maxWidth: 520, marginBottom: "2rem" }}>
              LandRetrieve.com nasce per connettere agenzie immobiliari, agenti indipendenti e broker con acquirenti qualificati da tutto il mondo, interessati agli immobili rurali.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
              {[
                {
                  icon: "🤝",
                  title: "Rete di professionisti qualificati",
                  text: "Solo agenti e agenzie verificati. Ogni profilo viene controllato prima della pubblicazione per garantire qualità e affidabilità.",
                },
                {
                  icon: "🎯",
                  title: "Buyer selezionati e motivati",
                  text: "Il nostro pubblico è composto da acquirenti nazionali e internazionali realmente interessati agli immobili rurali.",
                },
                {
                  icon: "📈",
                  title: "Visibilità immediata e misurabile",
                  text: "Statistiche in tempo reale su visualizzazioni, richieste e performance dei tuoi annunci direttamente dalla dashboard.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#e8f7ef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".95rem", color: "#111111", marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: ".875rem", color: "#4b5563", lineHeight: 1.6 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/registrati"
              style={{
                display: "inline-block",
                padding: ".9rem 2rem",
                borderRadius: 6,
                backgroundColor: "#26A55B",
                color: "#ffffff",
                fontSize: ".975rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background-color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
            >
              Crea il tuo profilo →
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
        @media (max-width: 900px) { .conn-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }
      `}</style>
    </section>
  );
}

// ─── PROFESSIONISTI ───────────────────────────────────────────────────────────
function Professionisti() {
  const cards = [
    {
      img: "/images/agenzie.png",
      alt: "Agenzie immobiliari - LandRetrieve.com",
      tag: "Agenzie",
      title: "Sei un'agenzia immobiliare?",
      text: "Porta il tuo team su LandRetrieve.com. Gestisci i tuoi agenti, pubblica annunci illimitati, ricevi richieste qualificate da buyer nazionali e internazionali interessati agli immobili rurali.",
      href: "/agenzie",
    },
    {
      img: "/images/agenti-broker.png",
      alt: "Agenti e broker immobiliari - LandRetrieve.com",
      tag: "Agenti & Broker",
      title: "Sei un agente o broker indipendente?",
      text: "Lavori in autonomia? LandRetrieve.com è aperto anche a broker e professionisti senza struttura agenziale. Valorizza il tuo lavoro con una piattaforma dedicata al settore immobiliare rurale.",
      href: "/agenti",
    },
  ];

  return (
    <section style={{ padding: "6rem 3rem", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Eyebrow center>Per chi è LandRetrieve.com</Eyebrow>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 600, lineHeight: 1.15, marginBottom: ".75rem", textAlign: "center" }}>
            Trova il professionista giusto
          </h2>
          <p style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.75, fontWeight: 300, maxWidth: 560, margin: "0 auto" }}>
            Agenzie strutturate o agenti indipendenti: LandRetrieve.com è la piattaforma pensata per professionisti del settore immobiliare rurale.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="prof-grid">
          {cards.map((card) => (
            <div
              key={card.tag}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #D4D4D4",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#26A55B")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#D4D4D4")}
            >
              <div style={{ position: "relative", height: 240, overflow: "hidden", backgroundColor: "#e8f7ef" }}>
                <Image src={card.img} alt={card.alt} fill style={{ objectFit: "cover" }} loading="lazy" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 60%)" }} />
              </div>
              <div style={{ padding: "2rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "#26A55B",
                    backgroundColor: "#e8f7ef",
                    padding: ".3rem .75rem",
                    borderRadius: 4,
                    marginBottom: "1rem",
                  }}
                >
                  {card.tag}
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#111111", marginBottom: ".75rem" }}>{card.title}</h3>
                <p style={{ fontSize: ".9rem", color: "#4b5563", lineHeight: 1.65, marginBottom: "1.5rem" }}>{card.text}</p>
                <Link
                  href={card.href}
                  style={{
                    display: "inline-block",
                    padding: ".7rem 1.5rem",
                    border: "1.5px solid #26A55B",
                    borderRadius: 6,
                    fontSize: ".875rem",
                    fontWeight: 600,
                    color: "#26A55B",
                    textDecoration: "none",
                    transition: "background-color .2s, color .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#26A55B";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#26A55B";
                  }}
                >
                  Scopri di più →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .prof-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ─── TIPOLOGIE ────────────────────────────────────────────────────────────────
function Tipologie() {
  const items = [
    { img: "/images/ville.jpg", alt: "Ville rurali in vendita", label: "Ville", href: "/cerca?tipologia=villa" },
    { img: "/images/agriturismi.jpg", alt: "Agriturismi in vendita", label: "Agriturismi", href: "/cerca?tipologia=agriturismo" },
    { img: "/images/casali.jpg", alt: "Casali ristrutturati in vendita", label: "Casali", href: "/cerca?tipologia=casale" },
    { img: "/images/aziende-agricole.jpg", alt: "Aziende agricole in vendita", label: "Az. Agricole", href: "/cerca?tipologia=azienda-agricola" },
    { img: "/images/terreni.jpg", alt: "Terreni agricoli ed edificabili", label: "Terreni", href: "/cerca?tipologia=terreno" },
  ];

  return (
    <section style={{ padding: "6rem 3rem", backgroundColor: "#f0fbf5" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <Eyebrow>Cosa trovi su LandRetrieve.com</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 600, lineHeight: 1.15, margin: 0 }}>
              Esplora per tipologia
            </h2>
          </div>
          <Link
            href="/cerca"
            style={{ fontSize: ".9rem", fontWeight: 600, color: "#26A55B", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Vedi tutti gli immobili →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }} className="tipo-grid">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                aspectRatio: "3/4",
                display: "block",
                textDecoration: "none",
                transition: "transform .3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ position: "absolute", inset: 0, backgroundColor: "#1a2a1a" }}>
                <Image src={item.img} alt={item.alt} fill style={{ objectFit: "cover", opacity: .85 }} loading="lazy" />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 60%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#ffffff", margin: "0 0 4px" }}>{item.label}</h3>
                <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.7)", fontWeight: 400 }}>Esplora →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .tipo-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 600px) { .tipo-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon: "🤝", title: "Supporto dedicato", text: "Un team sempre disponibile per aiutarti a configurare il profilo, ottimizzare gli annunci e risolvere qualsiasi problema tecnico." },
    { icon: "🔍", title: "Trasparenza totale", text: "Nessuna provvigione sulle vendite. Nessun costo nascosto. Sai esattamente quanto paghi e cosa ottieni. Prezzi chiari, risultati misurabili." },
    { icon: "📡", title: "Visibilità immediata", text: "I tuoi annunci sono visibili da subito a buyer qualificati. Ottimizzazione SEO inclusa per massimizzare la reach su Google e i motori di ricerca." },
    { icon: "🌐", title: "Collaborazione", text: "Costruisci relazioni con altri professionisti del settore. Il network LandRetrieve.com facilita le collaborazioni tra agenti e agenzie per chiudere più vendite." },
  ];

  return (
    <section style={{ padding: "6rem 3rem", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Eyebrow center>Strumenti professionali</Eyebrow>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 600, lineHeight: 1.15, textAlign: "center" }}>
            Cosa può fare LandRetrieve.com per te
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            backgroundColor: "#D4D4D4",
            border: "1px solid #D4D4D4",
            borderRadius: 12,
            overflow: "hidden",
          }}
          className="feat-grid"
        >
          {items.map(({ icon, title, text }) => (
            <div
              key={title}
              style={{
                backgroundColor: "#ffffff",
                padding: "2.25rem 1.75rem",
                transition: "background-color .2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0fbf5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#ffffff")}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: "#e8f7ef",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                }}
              >
                {icon}
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111111", marginBottom: ".65rem" }}>{title}</h3>
              <p style={{ fontSize: ".875rem", color: "#4b5563", lineHeight: 1.65 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .feat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
              @media (max-width: 600px) { .feat-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ─── INTERNAZIONALE ───────────────────────────────────────────────────────────
function Internazionale() {
  const stats = [
    { num: "60%+", label: "Acquirenti internazionali" },
    { num: "40+", label: "Paesi raggiunti" },
    { num: "€0", label: "Commissioni sulle vendite" },
    { num: "24/7", label: "Visibilità online" },
  ];
  const cards = [
    { flag: "🇬🇧", title: "Regno Unito & USA", sub: "Principale mercato di provenienza" },
    { flag: "🇩🇪", title: "Germania & Austria", sub: "Forte domanda per casali e vigneti" },
    { flag: "🇦🇺", title: "Australia & Nuova Zelanda", sub: "Crescita costante anno su anno" },
    { flag: "🌍", title: "Middle East & Asia", sub: "Interesse crescente per il lusso rurale" },
    { flag: "🌍", title: "Africa & Africa del Sud", sub: "Mercato emergente in forte espansione" },
  ];

  return (
    <section
      style={{
        padding: "6rem 3rem",
        background: "linear-gradient(150deg, #0a1f12 0%, #0f2a1a 50%, #122b1b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }} className="intl-grid">
          {/* Left */}
          <div>
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.5)",
                marginBottom: ".75rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Mercato globale
              <span style={{ flex: "0 0 32px", height: 1, backgroundColor: "rgba(255,255,255,.2)", display: "block" }} />
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 600, color: "#ffffff", lineHeight: 1.15, marginBottom: "1rem", maxWidth: 480 }}>
              Il mercato immobiliare è sempre più internazionale
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.65)", lineHeight: 1.75, fontWeight: 300, marginBottom: "2.5rem" }}>
              Gli acquirenti di immobili rurali arrivano da tutto il mondo. LandRetrieve.com ti connette con buyer da Europa, USA, Asia e Middle East che cercano la loro proprietà ideale.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
              {stats.map(({ num, label }) => (
                <div key={label} style={{ borderLeft: "2px solid rgba(38,165,91,.4)", paddingLeft: "1rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", lineHeight: 1, marginBottom: 4 }}>{num}</div>
                  <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
              <Link
                href="/registrati"
                style={{
                  padding: ".85rem 1.75rem",
                  borderRadius: 6,
                  backgroundColor: "#26A55B",
                  color: "#ffffff",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background-color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
              >
                Crea il tuo profilo →
              </Link>
              <Link
                href="/piani"
                style={{
                  padding: ".85rem 1.75rem",
                  borderRadius: 6,
                  border: "1.5px solid rgba(255,255,255,.3)",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  fontSize: ".9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "border-color .2s, background-color .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.6)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.3)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Scopri i piani
              </Link>
            </div>
          </div>

          {/* Right: country cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            {cards.map(({ flag, title, sub }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  backgroundColor: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  padding: ".85rem 1rem",
                  transition: "background-color .2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,.06)")}
              >
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{flag}</span>
                <div>
                  <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#ffffff" }}>{title}</div>
                  <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .intl-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }`}</style>
    </section>
  );
}

// ─── CTA BAND ─────────────────────────────────────────────────────────────────
function CtaBand() {
  return (
    <div
      style={{
        backgroundColor: "#f0fbf5",
        borderTop: "1px solid rgba(38,165,91,.15)",
        borderBottom: "1px solid rgba(38,165,91,.15)",
        padding: "4.5rem 3rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#111111", marginBottom: ".75rem" }}>
          Pronto a valorizzare il tuo lavoro?
        </h2>
        <p style={{ fontSize: "1rem", color: "#374151", marginBottom: "2rem", fontWeight: 300 }}>
          Unisciti ai professionisti che hanno scelto LandRetrieve.com per valorizzare i tuoi immobili rurali con buyer qualificati da tutto il mondo.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/registrati"
            style={{
              padding: ".9rem 2rem",
              borderRadius: 6,
              backgroundColor: "#26A55B",
              color: "#ffffff",
              fontSize: ".975rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background-color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
          >
            🚀 Registrati Gratis
          </Link>
          <Link
            href="/piani"
            style={{
              padding: ".9rem 2rem",
              borderRadius: 6,
              border: "1.5px solid #D4D4D4",
              backgroundColor: "transparent",
              color: "#111111",
              fontSize: ".975rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "border-color .2s, color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#26A55B";
              e.currentTarget.style.color = "#26A55B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#D4D4D4";
              e.currentTarget.style.color = "#111111";
            }}
          >
            Scopri i piani →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar transparent />
      <main>
        <Hero />
        <TrustBar />
        <Connessioni />
        <Professionisti />
        <Tipologie />
        <Features />
        <Internazionale />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
