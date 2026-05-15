import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar transparent />
      <main style={{ paddingTop: 72 }}>
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ fontSize: ".875rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#26A55B", marginBottom: "1rem" }}>
            LandRetrieve.com
          </p>
          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 800, color: "#111111", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            our hills, your home
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#4b5563", maxWidth: 560 }}>
            La piattaforma social-professionale per gli immobili rurali.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
