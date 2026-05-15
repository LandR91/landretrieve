"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { OfferWidget } from "@/components/offers/OfferWidget";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GREEN = "#26A55B";
const GREEN_LIGHT = "#e8f7ef";
const GREEN_XLIGHT = "#f0fbf5";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

// ── Mock data ─────────────────────────────────────────────────────────────────
interface Property {
  id: string;
  title: string;
  slug: string;
  listingType: "SALE" | "RENT";
  price: number;
  currency: string;
  category: string;
  mq: number;
  rooms: number;
  bathrooms: number;
  floors: number;
  year: number;
  condition: string;
  energy: string;
  address: string;
  comune: string;
  provincia: string;
  region: string;
  description: string;
  features: string[];
  images: string[];
  receiverId: string;
  agentName: string;
  agencyName: string;
  agentSlug: string;
  agencySlug: string;
  agentAvatar: string;
  agentPhone: string;
  agentEmail: string;
}

const MOCK_PROPERTIES: Record<string, Property> = {
  "casale-toscano-ref-001": {
    id: "prop-001",
    title: "Casale con Vista Panoramica sulle Colline Senesi",
    slug: "casale-toscano-ref-001",
    listingType: "SALE",
    price: 780000,
    currency: "EUR",
    category: "Casale",
    mq: 320,
    rooms: 6,
    bathrooms: 3,
    floors: 2,
    year: 1780,
    condition: "Ottimo",
    energy: "E",
    address: "Via delle Colline 12",
    comune: "Montalcino",
    provincia: "SI",
    region: "Toscana",
    description:
      "Magnifico casale del '700 completamente ristrutturato, immerso nel paesaggio collinare del Brunello di Montalcino. La proprietà si estende su 320 mq distribuiti su due livelli, con ampie terrazze panoramiche, giardino privato di 1.200 mq e oliveto di proprietà con 80 piante produttive.\n\nGli interni mantengono elementi originali in pietra e legno sapientemente abbinati a finiture contemporanee di pregio: pavimenti in cotto artigianale, soffitti con travi a vista, cucina spaziosa con camino antico. Il piano superiore ospita tre camere suite con bagni en-suite, tutte affacciate sulle colline. Al piano terra: soggiorno doppio, sala da pranzo, studio e dependance con ingresso indipendente.\n\nA soli 8 km da Montalcino e 45 minuti da Siena. Perfetto come residenza principale, casa vacanza o investimento turistico.",
    features: [
      "Piscina privata 12×6m",
      "Oliveto con 80 piante",
      "Giardino 1.200 mq",
      "Garage doppio",
      "Dependance indipendente",
      "Camino",
      "Riscaldamento a pavimento",
      "Impianto solare termico",
      "Pozzo artesiano",
      "Vista panoramica",
    ],
    images: [],
    receiverId: "receiver-agent-001",
    agentName: "Marco Ferretti",
    agencyName: "Tuscan Estates",
    agentSlug: "marco-ferretti",
    agencySlug: "tuscan-estates",
    agentAvatar: "",
    agentPhone: "+39 0577 123 456",
    agentEmail: "m.ferretti@tuscanestates.com",
  },
  "agriturismo-umbria-ref-002": {
    id: "prop-002",
    title: "Agriturismo in Umbria — 12 Camere + Ristorante",
    slug: "agriturismo-umbria-ref-002",
    listingType: "SALE",
    price: 1450000,
    currency: "EUR",
    category: "Agriturismo",
    mq: 850,
    rooms: 14,
    bathrooms: 12,
    floors: 3,
    year: 1650,
    condition: "Ottimo",
    energy: "D",
    address: "Loc. Pianaccio 8",
    comune: "Spello",
    provincia: "PG",
    region: "Umbria",
    description:
      "Storico agriturismo pienamente operativo nel cuore dell'Umbria, a pochi km da Assisi e Spello. La struttura comprende 12 camere con bagno privato, ristorante da 80 coperti, cantina per degustazioni, piscina panoramica e 15 ettari di terreno agricolo con vigneto DOC e uliveto.",
    features: [
      "12 camere con bagno en-suite",
      "Ristorante 80 coperti",
      "Cantina degustazioni",
      "Piscina panoramica",
      "15 ettari terreno",
      "Vigneto DOC",
      "Uliveto produttivo",
      "Parking 30 posti",
      "Sala eventi 150 persone",
      "Licenze attività attive",
    ],
    images: [],
    receiverId: "receiver-agency-002",
    agentName: "Giulia Marini",
    agencyName: "Umbria Immobiliare",
    agentSlug: "giulia-marini",
    agencySlug: "umbria-immobiliare",
    agentAvatar: "",
    agentPhone: "+39 0742 456 789",
    agentEmail: "g.marini@umbriaimm.it",
  },
  default: {
    id: "prop-default",
    title: "Villa Rustica con Piscina in Val d'Orcia",
    slug: "villa-val-dorcia-ref-000",
    listingType: "SALE",
    price: 560000,
    currency: "EUR",
    category: "Villa",
    mq: 240,
    rooms: 5,
    bathrooms: 2,
    floors: 2,
    year: 1920,
    condition: "Buono",
    energy: "F",
    address: "Podere La Ripa",
    comune: "Pienza",
    provincia: "SI",
    region: "Toscana",
    description:
      "Bellissima villa rustica nel cuore della Val d'Orcia, patrimonio UNESCO. La proprietà di 240 mq su due livelli include ampio soggiorno con camino, cucina abitabile, 5 camere da letto e 2 bagni. Terreno di 3.000 mq con piscina riscaldata e uliveto.",
    features: [
      "Piscina riscaldata",
      "Uliveto privato",
      "Terreno 3.000 mq",
      "Camino",
      "Vista Val d'Orcia",
      "Cantina",
      "Barbecue",
      "Wi-Fi fibra",
    ],
    images: [],
    receiverId: "receiver-agent-000",
    agentName: "Luca Bianchi",
    agencyName: "Val d'Orcia Realty",
    agentSlug: "luca-bianchi",
    agencySlug: "valdorcia-realty",
    agentAvatar: "",
    agentPhone: "+39 0578 789 012",
    agentEmail: "l.bianchi@valdorciarealty.it",
  },
};

function formatPrice(n: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function ImagePlaceholder({ index }: { index: number }) {
  const colors = ["#d1e7dd", "#d0e8f2", "#e8daf5", "#f5e8da", "#daf5e8"];
  const labels = ["Facciata principale", "Soggiorno", "Cucina", "Camera padronale", "Giardino e piscina"];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: colors[index % colors.length],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: ".4rem",
        color: MUTED,
        fontSize: ".78rem",
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: "1.6rem" }}>🏡</span>
      <span>{labels[index % labels.length]}</span>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const property = MOCK_PROPERTIES[slug as string] ?? MOCK_PROPERTIES["default"];

  const listBadgeColor = property.listingType === "SALE" ? GREEN : "#0ea5e9";
  const listBadgeLabel = property.listingType === "SALE" ? "Vendita" : "Affitto";

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: ".65rem 1.5rem", fontSize: ".78rem", color: MUTED, display: "flex", gap: ".4rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/cerca" style={{ color: MUTED, textDecoration: "none" }}>Immobili</Link>
          <span>/</span>
          <Link href={`/cerca?region=${property.region}`} style={{ color: MUTED, textDecoration: "none" }}>{property.region}</Link>
          <span>/</span>
          <span style={{ color: TEXT }}>{property.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Title row */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center", marginBottom: ".5rem", flexWrap: "wrap" }}>
            <span style={{ background: listBadgeColor, color: "#fff", fontSize: ".72rem", fontWeight: 700, padding: ".18rem .55rem", borderRadius: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>
              {listBadgeLabel}
            </span>
            <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: ".72rem", fontWeight: 700, padding: ".18rem .55rem", borderRadius: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>
              {property.category}
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: TEXT, margin: "0 0 .3rem", lineHeight: 1.3 }}>
            {property.title}
          </h1>
          <p style={{ fontSize: ".88rem", color: MUTED, margin: 0 }}>
            📍 {property.comune} ({property.provincia}) · {property.region}
          </p>
        </div>

        {/* Gallery + Sidebar layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
          {/* LEFT — main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Gallery */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${BORDER}` }}>
              <div style={{ height: 380, position: "relative" }}>
                <ImagePlaceholder index={0} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", height: 90 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ borderTop: `1px solid ${BORDER}`, borderLeft: i > 0 ? `1px solid ${BORDER}` : "none", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                    <ImagePlaceholder index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Key stats */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: ".75rem" }}>
                {[
                  { icon: "📐", label: "Superficie", value: `${property.mq} m²` },
                  { icon: "🛏", label: "Camere", value: property.rooms },
                  { icon: "🚿", label: "Bagni", value: property.bathrooms },
                  { icon: "🏗", label: "Anno", value: property.year },
                  { icon: "✨", label: "Stato", value: property.condition },
                  { icon: "⚡", label: "Classe en.", value: property.energy },
                  { icon: "🏢", label: "Piani", value: property.floors },
                  { icon: "📍", label: "Comune", value: property.comune },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: "center", padding: ".6rem .4rem", borderRadius: 8, background: "#f9f9f9" }}>
                    <div style={{ fontSize: "1.1rem", marginBottom: ".2rem" }}>{stat.icon}</div>
                    <div style={{ fontSize: ".65rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".15rem" }}>{stat.label}</div>
                    <div style={{ fontSize: ".85rem", fontWeight: 600, color: TEXT }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Descrizione</h2>
              {property.description.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontSize: ".88rem", color: TEXT_SOFT, lineHeight: 1.7, margin: i > 0 ? ".85rem 0 0" : 0 }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Features */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, margin: "0 0 .85rem" }}>Caratteristiche</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: ".45rem" }}>
                {property.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".85rem", color: TEXT_SOFT }}>
                    <span style={{ color: GREEN, fontWeight: 700 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.5rem .75rem", borderBottom: `1px solid ${BORDER}` }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, margin: 0 }}>Posizione</h2>
              </div>
              <div style={{ height: 260, background: "#e8efe4", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: ".5rem", color: MUTED }}>
                <span style={{ fontSize: "2rem" }}>🗺</span>
                <span style={{ fontSize: ".85rem", fontWeight: 600 }}>{property.comune}, {property.provincia} · {property.region}</span>
                <span style={{ fontSize: ".75rem" }}>La posizione esatta viene condivisa dopo il contatto</span>
              </div>
            </div>

            {/* Reference */}
            <div style={{ fontSize: ".72rem", color: MUTED, textAlign: "right" }}>
              Rif. #{property.id.toUpperCase()} · Annuncio su LandRetrieve.com
            </div>
          </div>

          {/* RIGHT — sticky sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1.5rem" }}>
            {/* Price card */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem" }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".3rem" }}>
                Prezzo {property.listingType === "RENT" ? "mensile" : ""} (IVA inclusa)
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: ".2rem" }}>
                {formatPrice(property.price, property.currency)}
              </div>
              {property.listingType === "SALE" && (
                <div style={{ fontSize: ".75rem", color: MUTED }}>
                  ≈ {formatPrice(Math.round(property.price / property.mq), property.currency)}/m²
                </div>
              )}
            </div>

            {/* Offer widget */}
            <OfferWidget
              propertyId={property.id}
              receiverId={property.receiverId}
              currency={property.currency}
              listingType={property.listingType}
            />

            {/* Agent card */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem" }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: MUTED, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".75rem" }}>
                Proposto da
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".85rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem", fontWeight: 700, color: GREEN }}>
                  {property.agentName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".88rem", color: TEXT }}>{property.agentName}</div>
                  <Link href={`/agenzie/${property.agencySlug}`} style={{ fontSize: ".75rem", color: GREEN, textDecoration: "none" }}>
                    {property.agencyName}
                  </Link>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                <a
                  href={`tel:${property.agentPhone}`}
                  style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: TEXT_SOFT, textDecoration: "none", padding: ".45rem .6rem", background: "#f5f5f5", borderRadius: 7 }}
                >
                  📞 {property.agentPhone}
                </a>
                <a
                  href={`mailto:${property.agentEmail}`}
                  style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: TEXT_SOFT, textDecoration: "none", padding: ".45rem .6rem", background: "#f5f5f5", borderRadius: 7 }}
                >
                  ✉️ {property.agentEmail}
                </a>
              </div>
              <div style={{ marginTop: ".85rem", display: "flex", gap: ".5rem" }}>
                <Link
                  href={`/agenti/${property.agentSlug}`}
                  style={{ flex: 1, textAlign: "center", padding: ".5rem", border: `1.5px solid ${GREEN}`, color: GREEN, borderRadius: 7, fontSize: ".78rem", fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = GREEN_XLIGHT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Vedi profilo
                </Link>
              </div>
            </div>

            {/* Share / save */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button
                  style={{ flex: 1, padding: ".5rem", border: `1.5px solid ${BORDER}`, borderRadius: 7, fontSize: ".78rem", fontWeight: 600, color: TEXT_SOFT, background: "transparent", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_SOFT; }}
                >
                  ♡ Salva
                </button>
                <button
                  style={{ flex: 1, padding: ".5rem", border: `1.5px solid ${BORDER}`, borderRadius: 7, fontSize: ".78rem", fontWeight: 600, color: TEXT_SOFT, background: "transparent", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_SOFT; }}
                >
                  ↗ Condividi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
