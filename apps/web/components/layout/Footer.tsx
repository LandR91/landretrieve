import Link from "next/link";

const TIPOLOGIE = [
  { label: "Ville", href: "/cerca?tipologia=villa" },
  { label: "Agriturismi", href: "/cerca?tipologia=agriturismo" },
  { label: "Casali", href: "/cerca?tipologia=casale" },
  { label: "Aziende Agricole", href: "/cerca?tipologia=azienda-agricola" },
  { label: "Terreni", href: "/cerca?tipologia=terreno" },
];

const LANDRETRIEVE_LINKS = [
  { label: "Agenzie", href: "/agenzie" },
  { label: "Agenti", href: "/agenti" },
  { label: "Piani", href: "/piani" },
  { label: "Chi Siamo", href: "/chi-siamo" },
  { label: "Contatti", href: "/contatti" },
  { label: "FAQ", href: "/faq" },
];

const LEGALE_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Termini & Condizioni", href: "/termini" },
  { label: "T&C d'acquisto", href: "/termini-acquisto" },
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Cookie", href: "/cookie-policy" },
  { label: "Termini", href: "/termini" },
  { label: "Sitemap", href: "/sitemap" },
];

const linkStyle: React.CSSProperties = {
  fontSize: ".875rem",
  color: "#3a3a3a",
  cursor: "pointer",
  textDecoration: "none",
  transition: "color .15s",
  display: "block",
};

const h4Style: React.CSSProperties = {
  fontSize: ".72rem",
  fontWeight: 700,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#1a1a1a",
  marginBottom: "1rem",
  margin: "0 0 1rem",
};

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#CACACA", padding: "3.5rem 3rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            paddingBottom: "2.5rem",
            borderBottom: "1px solid rgba(0,0,0,.12)",
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand */}
          <div>
            <div style={{ marginBottom: ".85rem" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>
                  LandRetrieve.com
                </span>
              </Link>
            </div>
            <p style={{ fontSize: ".875rem", color: "#3a3a3a", lineHeight: 1.7, maxWidth: 260, marginBottom: "1.25rem" }}>
              Portale immobiliare dedicato agli immobili rurali. Solo professionisti verificati, solo buyer qualificati.
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.25rem" }}>
              <a
                href="https://www.facebook.com/landretrieve"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: "1px solid #1877F2",
                  backgroundColor: "#1877F2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "opacity .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/landretrieve"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: "1px solid #e6683c",
                  background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "opacity .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/landretrieve"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: "1px solid #0A66C2",
                  backgroundColor: "#0A66C2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "opacity .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            {/* Settings */}
            <div>
              <h4 style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#5a5a5a", marginBottom: ".6rem" }}>
                Impostazioni
              </h4>
              {[
                { icon: "🌐", options: ["Italiano", "English"] },
                { icon: "💰", options: ["EUR €", "USD $", "GBP £", "CHF"] },
                { icon: "📐", options: ["m²", "ft²"] },
              ].map(({ icon, options }) => (
                <div key={icon} style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".4rem" }}>
                  <span style={{ fontSize: ".72rem", color: "#5a5a5a" }}>{icon}</span>
                  <select
                    style={{
                      border: "1px solid rgba(0,0,0,.15)",
                      borderRadius: 4,
                      padding: ".3rem .6rem",
                      fontSize: ".75rem",
                      background: "rgba(255,255,255,.5)",
                      color: "#3a3a3a",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      appearance: "none" as const,
                    }}
                  >
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Tipologie */}
          <div>
            <h4 style={h4Style}>Tipologie</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {TIPOLOGIE.map((item) => (
                <li key={item.href} style={{ marginBottom: ".5rem" }}>
                  <Link
                    href={item.href}
                    style={linkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#26A55B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: LandRetrieve.com */}
          <div>
            <h4 style={h4Style}>LandRetrieve.com</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {LANDRETRIEVE_LINKS.map((item) => (
                <li key={item.href} style={{ marginBottom: ".5rem" }}>
                  <Link
                    href={item.href}
                    style={linkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#26A55B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legale */}
          <div>
            <h4 style={h4Style}>Legale</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {LEGALE_LINKS.map((item) => (
                <li key={item.href} style={{ marginBottom: ".5rem" }}>
                  <Link
                    href={item.href}
                    style={linkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#26A55B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: ".78rem", color: "#5a5a5a" }}>
            © 2025 - SB.LAND - P.Iva IT 07385730481 | Tutti i diritti riservati.
          </div>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {BOTTOM_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: ".75rem", color: "#5a5a5a", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#26A55B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a5a")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
