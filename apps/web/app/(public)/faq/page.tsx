"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

const FAQS = [
  {
    q: "Che cos'è LandRetrieve.com?",
    a: "LandRetrieve.com è il portale immobiliare dedicato esclusivamente agli immobili rurali italiani. Connette agenzie, agenti indipendenti e broker con acquirenti qualificati provenienti da tutta Italia e dall'estero. Solo proprietà rurali: ville, casali, agriturismi, aziende agricole e terreni.",
  },
  {
    q: "Chi può iscriversi?",
    a: "Possono iscriversi agenzie immobiliari, agenti indipendenti, broker e collaboratori specializzati nel settore rurale. I visitatori possono consultare gli annunci e i profili senza registrazione. Per pubblicare annunci o contattare i professionisti è necessaria la registrazione.",
  },
  {
    q: "Come ci si registra?",
    a: "Clicca su 'Registrati' in alto a destra, compila il modulo con i tuoi dati e seleziona il tuo ruolo (Agenzia, Agente, Broker o Visitatore). Al termine, riceverai un'email di conferma per attivare il tuo account.",
  },
  {
    q: "La registrazione è gratuita?",
    a: "Sì, la registrazione è completamente gratuita. L'attivazione di un piano Connect (€29,90/mese IVA inclusa) o Signature è necessaria per pubblicare annunci e accedere a tutte le funzionalità professionali.",
  },
  {
    q: "Quali tipologie di immobili si possono pubblicare?",
    a: "LandRetrieve.com accetta: ville di campagna, agriturismi, casali storici, aziende agricole, terreni agricoli e forestali, e altre proprietà rurali. Non sono accettati appartamenti in città o immobili privi di caratteristiche rurali.",
  },
  {
    q: "Come si inserisce un annuncio?",
    a: "Dalla tua dashboard, clicca su 'Crea annuncio' e segui il modulo guidato in 6 step: informazioni base, dati catastali, dettagli tecnici, galleria fotografica, posizione su mappa e pubblicazione. Puoi salvare la bozza in qualsiasi momento e riprendere in seguito.",
  },
  {
    q: "Perché sono richiesti i Dati Catastali?",
    a: "I dati catastali (Comune, Foglio, Particella, Subalterno) garantiscono l'unicità e l'autenticità di ogni annuncio. Prevengono la pubblicazione di duplicati e aumentano la fiducia degli acquirenti, che sanno di avere a che fare con professionisti seri e trasparenti.",
  },
  {
    q: "Come vengono trattati i Dati Catastali?",
    a: "I dati catastali sono cifrati e conservati in modo sicuro. Non sono visibili agli acquirenti né a terze parti. Vengono utilizzati esclusivamente per verifica interna dell'unicità dell'annuncio e non vengono mai condivisi o venduti.",
  },
  {
    q: "Quanto costa pubblicare un immobile?",
    a: "Con il piano Connect (€29,90/mese IVA inclusa) puoi pubblicare annunci illimitati. Il piano Signature aggiunge opzioni personalizzate come il Badge Verificato e slot In Primo Piano. Tutti i prezzi sono IVA inclusa. Nessun costo aggiuntivo per numero di annunci.",
  },
  {
    q: "Ci sono provvigioni sulle vendite?",
    a: "No. LandRetrieve.com non applica nessuna commissione sulle compravendite o sulle locazioni concluse tramite la piattaforma. Paghi solo l'abbonamento mensile o annuale, senza sorprese.",
  },
  {
    q: "Cos'è il Badge Verificato?",
    a: "Il Badge Verificato è un sigillo di fiducia che attesta la verifica dell'identità professionale del profilo. L'agenzia o l'agente ha fornito documenti validi (licenza, P.IVA) che sono stati controllati dal team di LandRetrieve.com. Il badge aumenta la visibilità nei risultati di ricerca.",
  },
  {
    q: "Cosa significa 'In Primo Piano'?",
    a: "Gli annunci 'In Primo Piano' (IPP) godono di un posizionamento prioritario nei risultati di ricerca e nelle pagine di categoria. Il costo è di €7,90/mese per annuncio (IVA inclusa). Lo slot è fisso: rimane attivo fino alla vendita dell'immobile o alla cancellazione manuale da parte del professionista.",
  },
  {
    q: "Come funziona la messaggistica?",
    a: "Gli acquirenti interessati possono inviare richieste direttamente dalla pagina dell'annuncio. Le richieste arrivano nella sezione 'Messaggi' della tua dashboard. Tutta la comunicazione avviene in modo sicuro all'interno della piattaforma, senza condivisione di dati personali con terze parti.",
  },
  {
    q: "Posso fare un'offerta su un immobile?",
    a: "Sì. Dalla pagina dell'annuncio puoi inviare un'offerta formale che viene notificata al professionista responsabile. Il professionista può accettare, rifiutare o fare una controfferta. Tutte le offerte sono tracciate nella sezione 'Offerte' della dashboard.",
  },
  {
    q: "Cosa succede quando vendo un immobile In Primo Piano?",
    a: "Quando archivi o segni come venduto un immobile con lo slot In Primo Piano, il posizionamento premium termina automaticamente. Non verrà addebitato nessun costo aggiuntivo. Puoi riassegnare lo slot a un altro immobile del tuo portafoglio.",
  },
  {
    q: "Posso pubblicare immobili fuori dall'Italia?",
    a: "Sì. LandRetrieve.com accetta proprietà rurali situate in tutta Europa. Il portale è particolarmente forte sul mercato italiano, ma supporta annunci con descrizioni multilingua per raggiungere acquirenti internazionali interessati al patrimonio rurale europeo.",
  },
  {
    q: "Come posso aggiungere agenti al mio team?",
    a: "Dalla dashboard agenzia, vai nella sezione 'Agenti' e clicca su 'Crea Agente'. Inserisci i dati del collaboratore (nome, email, licenza, ruolo) e una password temporanea. L'agente riceverà un invito via email per attivare il proprio profilo all'interno della tua agenzia.",
  },
  {
    q: "Hai altre domande?",
    a: "Scrivici dalla pagina Contatti o invia un'email a info@landretrieve.com. Il team risponde entro 24 ore lavorative. Puoi anche seguirci sui social per aggiornamenti, guide e novità sul mercato rurale italiano.",
  },
];

function AccordionItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${open ? GREEN : BORDER}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color .2s",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", textAlign: "left",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1.1rem 1.25rem", gap: "1rem",
          background: "transparent", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1 }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, color: GREEN, background: "#f0fbf5", padding: ".15rem .45rem", borderRadius: 4, flexShrink: 0 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontWeight: 600, fontSize: ".95rem", color: TEXT, lineHeight: 1.4 }}>
            {faq.q}
          </span>
        </div>
        <span
          style={{
            fontSize: "1.1rem", color: open ? GREEN : "#5a5a5a",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform .2s, color .2s",
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", paddingLeft: "3.25rem" }}>
          <p style={{ margin: 0, fontSize: ".88rem", color: LABEL, lineHeight: 1.8 }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0a2e1a 0%, #1a6638 100%)",
            padding: "4.5rem 3rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#4ade80", marginBottom: ".75rem" }}>
              Domande frequenti
            </p>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800, color: "#ffffff",
                letterSpacing: "-.02em", margin: "0 0 1rem",
              }}
            >
              Tutto quello che devi sapere
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.75)", lineHeight: 1.7, margin: 0 }}>
              Trova risposte a tutte le domande su LandRetrieve.com.
              Non trovi quello che cerchi? <Link href="/contatti" style={{ color: "#4ade80", textDecoration: "none" }}>Scrivici</Link>.
            </p>
          </div>
        </section>

        {/* ── Accordion ── */}
        <section style={{ padding: "3.5rem 3rem 5rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} faq={faq} index={i} />
            ))}
          </div>

          {/* CTA sotto accordion */}
          <div style={{ maxWidth: 780, margin: "2.5rem auto 0", textAlign: "center" }}>
            <p style={{ fontSize: ".9rem", color: "#5a5a5a", marginBottom: "1rem" }}>
              Hai ancora dubbi? Il nostro team è a disposizione.
            </p>
            <Link
              href="/contatti"
              style={{
                display: "inline-block", padding: ".75rem 2rem",
                background: GREEN, color: "#fff",
                borderRadius: 8, fontWeight: 600, fontSize: ".9rem",
                textDecoration: "none", transition: "background-color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
            >
              Contattaci
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
