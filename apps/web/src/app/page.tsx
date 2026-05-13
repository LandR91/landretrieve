export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-content py-24 text-center">
        <h1 className="text-4xl font-bold text-[#111111] mb-4">
          LandRetrieve
        </h1>
        <p className="text-lg text-[#4b5563]">
          Rural properties in Italy
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="/cerca" className="btn-primary">
            Cerca immobili
          </a>
          <a href="/contatti" className="btn-secondary">
            Contattaci
          </a>
        </div>
      </div>
    </main>
  )
}
