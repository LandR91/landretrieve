export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        <p className="eyebrow mb-4" style={{ color: "var(--green)" }}>
          LandRetrieve.com
        </p>
        <h1
          className="mb-4 font-bold"
          style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
        >
          our hills, your home
        </h1>
        <p className="text-lg" style={{ color: "var(--text-soft)" }}>
          La piattaforma social-professionale per gli immobili rurali.
        </p>
        <p className="mt-8 text-sm" style={{ color: "var(--muted-text)" }}>
          — Foundation setup completo · FASE 1 ✓
        </p>
      </div>
    </main>
  );
}
