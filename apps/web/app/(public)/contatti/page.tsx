"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRecaptcha } from "@/hooks/use-recaptcha";

const GREEN = "#26A55B";
const TEXT = "#111111";
const LABEL = "#374151";
const BORDER = "#D4D4D4";

const CHI_SONO_OPTIONS = [
  "Agenzia immobiliare",
  "Agente indipendente",
  "Broker",
  "Acquirente / Investitore",
  "Giornalista / Media",
  "Altro",
];

export default function ContattiPage() {
  const { getToken } = useRecaptcha();
  const [form, setForm] = useState({
    nome: "", tel: "", email: "", chiSono: "", messaggio: "", privacy: false,
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(key: string, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Campo obbligatorio";
    if (!form.tel.trim()) e.tel = "Campo obbligatorio";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email non valida";
    if (!form.chiSono) e.chiSono = "Seleziona un'opzione";
    if (!form.messaggio.trim() || form.messaggio.trim().length < 10) e.messaggio = "Messaggio troppo breve";
    if (!form.privacy) e.privacy = "Devi accettare la privacy policy";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await getToken("contact");
    // Simulates API call — in production creates a Thread in DB (no email sent)
    setTimeout(() => { setLoading(false); setSent(true); }, 800);
  }

  function fieldStyle(name: string): React.CSSProperties {
    return {
      width: "100%", padding: ".65rem .85rem",
      border: `1.5px solid ${errors[name] ? "#dc2626" : focused === name ? GREEN : BORDER}`,
      borderRadius: 8, fontSize: ".9rem", color: TEXT,
      background: "#fff", outline: "none",
      transition: "border-color .2s",
      boxSizing: "border-box",
      fontFamily: "inherit",
    };
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* ── Hero ── */}
        <section style={{ background: "linear-gradient(135deg, #0a2e1a 0%, #1a6638 100%)", padding: "4rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <p style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#4ade80", marginBottom: ".75rem" }}>
              Contatti
            </p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-.02em", margin: "0 0 1rem" }}>
              Siamo qui per aiutarti
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.75)", lineHeight: 1.7, margin: 0 }}>
              Hai domande sulla piattaforma, sul tuo account o vuoi semplicemente parlare con noi?
              Scrivi un messaggio e ti risponderemo entro 24 ore lavorative.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section style={{ padding: "4rem 3rem 5rem", background: "#f5f5f5" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 400px", gap: "3rem", alignItems: "flex-start" }} className="contatti-grid">

            {/* Form */}
            <div style={{ background: "#ffffff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "2.5rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: TEXT, margin: "0 0 .4rem", letterSpacing: "-.01em" }}>
                Invia un messaggio
              </h2>
              <p style={{ fontSize: ".85rem", color: "#5a5a5a", margin: "0 0 2rem" }}>
                Tutti i campi contrassegnati con * sono obbligatori.
              </p>

              {sent ? (
                <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
                  <h3 style={{ fontWeight: 700, color: TEXT, margin: "0 0 .5rem" }}>Messaggio inviato!</h3>
                  <p style={{ fontSize: ".88rem", color: "#5a5a5a" }}>
                    Ti risponderemo entro 24 ore lavorative.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }} className="form-row">
                    <div>
                      <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                        Nome e Cognome *
                      </label>
                      <input
                        type="text"
                        placeholder="Mario Rossi"
                        value={form.nome}
                        onChange={(e) => update("nome", e.target.value)}
                        onFocus={() => setFocused("nome")}
                        onBlur={() => setFocused(null)}
                        style={fieldStyle("nome")}
                      />
                      {errors.nome && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".25rem 0 0" }}>{errors.nome}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                        Telefono *
                      </label>
                      <input
                        type="tel"
                        placeholder="+39 333 1234567"
                        value={form.tel}
                        onChange={(e) => update("tel", e.target.value)}
                        onFocus={() => setFocused("tel")}
                        onBlur={() => setFocused(null)}
                        style={fieldStyle("tel")}
                      />
                      {errors.tel && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".25rem 0 0" }}>{errors.tel}</p>}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                      E-mail *
                    </label>
                    <input
                      type="email"
                      placeholder="mario.rossi@email.it"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      style={fieldStyle("email")}
                    />
                    {errors.email && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".25rem 0 0" }}>{errors.email}</p>}
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                      Chi sono *
                    </label>
                    <select
                      value={form.chiSono}
                      onChange={(e) => update("chiSono", e.target.value)}
                      onFocus={() => setFocused("chiSono")}
                      onBlur={() => setFocused(null)}
                      style={{ ...fieldStyle("chiSono"), appearance: "none" as const, cursor: "pointer" }}
                    >
                      <option value="">Seleziona...</option>
                      {CHI_SONO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.chiSono && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".25rem 0 0" }}>{errors.chiSono}</p>}
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: LABEL, marginBottom: ".3rem" }}>
                      Messaggio *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Scrivi il tuo messaggio..."
                      value={form.messaggio}
                      onChange={(e) => update("messaggio", e.target.value)}
                      onFocus={() => setFocused("messaggio")}
                      onBlur={() => setFocused(null)}
                      style={{ ...fieldStyle("messaggio"), resize: "vertical", minHeight: 120 }}
                    />
                    {errors.messaggio && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".25rem 0 0" }}>{errors.messaggio}</p>}
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", cursor: "pointer", fontSize: ".82rem", color: LABEL, lineHeight: 1.5 }}>
                      <input
                        type="checkbox"
                        checked={form.privacy}
                        onChange={(e) => update("privacy", e.target.checked)}
                        style={{ accentColor: GREEN, width: 16, height: 16, cursor: "pointer", marginTop: ".1rem", flexShrink: 0 }}
                      />
                      <span>
                        Ho letto e accetto la{" "}
                        <a href="/privacy-policy" style={{ color: GREEN, textDecoration: "none" }}>Privacy Policy</a>.
                        I tuoi dati saranno trattati ai sensi del GDPR esclusivamente per rispondere alla tua richiesta.
                      </span>
                    </label>
                    {errors.privacy && <p style={{ fontSize: ".72rem", color: "#dc2626", margin: ".3rem 0 0" }}>{errors.privacy}</p>}
                  </div>

                  <p style={{ fontSize: ".72rem", color: "#5a5a5a", marginBottom: "1rem" }}>
                    Questo sito è protetto da reCAPTCHA. Si applicano le{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: GREEN }}>Norme sulla privacy</a> e i{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: GREEN }}>Termini di servizio</a> di Google.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: ".8rem",
                      background: loading ? "#9ca3af" : GREEN,
                      color: "#fff", border: "none",
                      borderRadius: 8, fontWeight: 700, fontSize: ".95rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "background-color .2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#1d8a4b"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GREEN; }}
                  >
                    {loading ? "Invio in corso..." : "Invia messaggio"}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar: social + info */}
            <div>
              {/* Social */}
              <div style={{ background: "#ffffff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "2rem", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: TEXT, margin: "0 0 .4rem" }}>Seguici sui social</h3>
                <p style={{ fontSize: ".82rem", color: "#5a5a5a", lineHeight: 1.6, margin: "0 0 1.25rem" }}>
                  Seguendoci aiuterai più persone a trovare la loro casa dei sogni.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                  <a
                    href="https://www.facebook.com/landretrieve"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem .9rem", borderRadius: 8, border: `1.5px solid #1877F2`, textDecoration: "none", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eef4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </div>
                    <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#1877F2" }}>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com/landretrieve"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem .9rem", borderRadius: 8, border: "1.5px solid #e6683c", textDecoration: "none", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    </div>
                    <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#e6683c" }}>Instagram</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/landretrieve"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem .9rem", borderRadius: 8, border: "1.5px solid #0A66C2", textDecoration: "none", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eef4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    </div>
                    <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#0A66C2" }}>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Info */}
              <div style={{ background: "#f0fbf5", borderRadius: 16, border: `1px solid ${GREEN}30`, padding: "1.5rem" }}>
                <h4 style={{ fontSize: ".85rem", fontWeight: 700, color: TEXT, margin: "0 0 .75rem" }}>Info utili</h4>
                {[
                  { icon: "⏱️", text: "Risposta entro 24 ore lavorative" },
                  { icon: "📍", text: "Certaldo (FI), Italia" },
                  { icon: "✉️", text: "info@landretrieve.com" },
                  { icon: "🔒", text: "I dati sono trattati in conformità al GDPR" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginBottom: ".5rem", fontSize: ".82rem", color: LABEL }}>
                    <span style={{ flexShrink: 0 }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contatti-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
