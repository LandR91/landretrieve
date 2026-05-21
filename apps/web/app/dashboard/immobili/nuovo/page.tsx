"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { PROVINCE, getComuniByProvincia } from "@/lib/istat";
import api from "@/lib/api";

// ─── Constants ───────────────────────────────────────────────────────────────
const MAPS_KEY = "AIzaSyCXU5OQRShbztd7a-A5_LFwmVkwOdaOYnk";
const DRAFT_KEY = "lr_prop_draft";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BG = "#f5f5f5";
const BORDER = "#D4D4D4";
const LABEL_COLOR = "#374151";

// ─── Tipologie ───────────────────────────────────────────────────────────────
const TIPOLOGIE: Record<string, string[]> = {
  Terreno: [
    "Terreno agricolo",
    "Terreno edificabile",
    "Vigneto",
    "Oliveto",
    "Bosco",
    "Pascolo",
    "Orto",
  ],
  "Rurale residenziale": [
    "Casale",
    "Villa rurale",
    "Agriturismo",
    "Cascina",
    "Masseria",
    "Trullo",
    "Baita/Chalet",
    "Borgo",
    "Mulino",
  ],
  "Struttura ricettiva": [
    "Hotel boutique",
    "B&B rurale",
    "Resort & Spa",
    "Glamping",
  ],
  "Azienda agricola": [
    "Cantina vinicola",
    "Frantoio",
    "Fattoria",
  ],
};

// ─── Form data type ──────────────────────────────────────────────────────────
interface FormData {
  titolo: string;
  descrizione: string;
  tipologiaPadre: string;
  tipologiaFiglio: string;
  tipoContratto: "Vendita" | "Affitto" | "";
  prezzo: string;
  valuta: string;
  catasto: "TERRENI" | "FABBRICATI" | "";
  provincia: string;
  provinciaCode: string;
  comune: string;
  foglioMappa: string;
  particella: string;
  subalterno: string;
  superficieTotale: string;
  superficieAbitativa: string;
  superficieTerreno: string;
  numLocali: string;
  numCamere: string;
  numBagni: string;
  piano: string;
  annoCostruzione: string;
  stato: string;
  classeEnergetica: string;
  riscaldamento: string;
  piscina: boolean;
  garagePostoAuto: boolean;
  videoUrl: string;
  tour360: string;
  lat: number | null;
  lng: number | null;
}

const initialFormData: FormData = {
  titolo: "",
  descrizione: "",
  tipologiaPadre: "",
  tipologiaFiglio: "",
  tipoContratto: "",
  prezzo: "",
  valuta: "EUR",
  catasto: "",
  provincia: "",
  provinciaCode: "",
  comune: "",
  foglioMappa: "",
  particella: "",
  subalterno: "",
  superficieTotale: "",
  superficieAbitativa: "",
  superficieTerreno: "",
  numLocali: "",
  numCamere: "",
  numBagni: "",
  piano: "",
  annoCostruzione: "",
  stato: "",
  classeEnergetica: "",
  riscaldamento: "",
  piscina: false,
  garagePostoAuto: false,
  videoUrl: "",
  tour360: "",
  lat: null,
  lng: null,
};

// ─── Shared style helpers ────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  fontSize: 14,
  color: TEXT,
  backgroundColor: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: LABEL_COLOR,
  marginBottom: 5,
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#dc2626",
  marginTop: 4,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 24px",
  backgroundColor: GREEN,
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 24px",
  backgroundColor: "#ffffff",
  color: TEXT,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s",
};

// ─── Focus/blur handlers ─────────────────────────────────────────────────────
function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = GREEN;
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = BORDER;
}

// ─── Section header with separator ──────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>
        {title}
      </h2>
      <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: 0 }} />
    </div>
  );
}

// ─── Places autocomplete subcomponent ────────────────────────────────────────
function PlacesSearch({
  onPlaceSelect,
}: {
  onPlaceSelect: (lat: number, lng: number) => void;
}) {
  const placesLib = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ["geometry"],
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        onPlaceSelect(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      }
    });
    return () => {
      if (listener) listener.remove();
    };
  }, [placesLib, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Cerca indirizzo..."
      style={{ ...inputStyle, marginBottom: 12 }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

// ─── Map inner component (needs to be inside APIProvider) ────────────────────
function MapStep({
  lat,
  lng,
  onPositionChange,
}: {
  lat: number | null;
  lng: number | null;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const handlePlaceSelect = useCallback(
    (newLat: number, newLng: number) => {
      onPositionChange(newLat, newLng);
    },
    [onPositionChange]
  );

  const center = lat !== null && lng !== null
    ? { lat, lng }
    : { lat: 42.5, lng: 12.5 };

  return (
    <div>
      <PlacesSearch onPlaceSelect={handlePlaceSelect} />
      <Map
        style={{ width: "100%", height: 400, borderRadius: 8, overflow: "hidden" }}
        defaultCenter={{ lat: 42.5, lng: 12.5 }}
        center={center}
        defaultZoom={6}
        zoom={lat !== null ? 13 : 6}
        mapId="lr-map"
        onClick={(e) => {
          if (e.detail.latLng) {
            onPositionChange(e.detail.latLng.lat, e.detail.latLng.lng);
          }
        }}
      >
        {lat !== null && lng !== null && (
          <AdvancedMarker
            position={{ lat, lng }}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                onPositionChange(e.latLng.lat(), e.latLng.lng());
              }
            }}
          />
        )}
      </Map>
      {lat !== null && lng !== null ? (
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
          Lat: {lat.toFixed(5)} — Lng: {lng.toFixed(5)}
        </p>
      ) : (
        <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
          Clicca sulla mappa o cerca un indirizzo per impostare la posizione.
        </p>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function NuovoImmobilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftBanner, setDraftBanner] = useState(false);
  const [fileError, setFileError] = useState("");

  // Province autocomplete
  const [provinciaInput, setProvinciaInput] = useState("");
  const [provinceSuggestions, setProvinceSuggestions] = useState<typeof PROVINCE>([]);
  const [showProvinceSugg, setShowProvinceSugg] = useState(false);

  // Publish gate
  const [gateData, setGateData] = useState<{ canPublish: boolean; missing: string[] } | null>(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Drop zone drag state
  const [imgDragOver, setImgDragOver] = useState(false);
  const [docDragOver, setDocDragOver] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<FormData>;
        setFormData((prev) => ({ ...prev, ...saved }));
        if (saved.provinciaCode) {
          const prov = PROVINCE.find((p) => p.codice === saved.provinciaCode);
          if (prov) setProvinciaInput(prov.nome);
        }
        setDraftBanner(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Auto-save to localStorage (debounced 500ms) ──
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...formData }));
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData]);

  // ── Load publish gate on mount ──
  useEffect(() => {
    setGateLoading(true);
    api
      .get<{ canPublish: boolean; missing: string[] }>("/api/auth/gate/publish")
      .then((res) => setGateData(res.data))
      .catch(() => setGateData({ canPublish: true, missing: [] }))
      .finally(() => setGateLoading(false));
  }, []);

  // ── Helpers ──
  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(initialFormData);
    setProvinciaInput("");
    setDraftBanner(false);
  }

  // ── Validation (all fields at once) ──
  function validateAll(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!formData.titolo.trim()) e.titolo = "Il titolo è obbligatorio";
    if (!formData.tipologiaPadre) e.tipologiaPadre = "Seleziona una tipologia";
    if (!formData.tipologiaFiglio) e.tipologiaFiglio = "Seleziona una sottotipologia";
    if (!formData.tipoContratto) e.tipoContratto = "Seleziona il tipo di contratto";
    if (!formData.prezzo.trim()) {
      e.prezzo = "Il prezzo è obbligatorio";
    } else if (isNaN(Number(formData.prezzo)) || Number(formData.prezzo) <= 0) {
      e.prezzo = "Inserisci un prezzo valido maggiore di zero";
    }
    if (!formData.catasto) e.catasto = "Seleziona il tipo di catasto";
    if (!formData.provinciaCode) e.provincia = "La provincia è obbligatoria";
    if (!formData.comune) e.comune = "Il comune è obbligatorio";
    if (!formData.foglioMappa.trim()) e.foglioMappa = "Il foglio di mappa è obbligatorio";
    if (!formData.particella.trim()) e.particella = "La particella è obbligatoria";
    if (
      formData.videoUrl.trim() &&
      !formData.videoUrl.includes("youtube.com") &&
      !formData.videoUrl.includes("youtu.be") &&
      !formData.videoUrl.includes("vimeo.com")
    ) {
      e.videoUrl = "URL non valido. Sono accettati solo YouTube e Vimeo.";
    }
    if (formData.lat === null || formData.lng === null) {
      e.position = "Devi impostare la posizione sulla mappa prima di continuare.";
    }
    return e;
  }

  // ── Submit ──
  async function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    const e = validateAll();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setSubmitError("Correggi i campi in rosso prima di continuare.");
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    // Catasto duplicate check
    try {
      const res = await api.get("/api/properties/catasto-check", {
        params: {
          catasto: formData.catasto,
          provincia: formData.provinciaCode,
          comune: formData.comune,
          foglio: formData.foglioMappa,
          particella: formData.particella,
        },
      });
      if (res.status === 409 || (res.data && res.data.duplicate)) {
        setErrors({
          catasto: "Esiste già un immobile con questi dati catastali. Verifica i dati inseriti.",
        });
        setSubmitting(false);
        return;
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { duplicate?: boolean } } };
      if (
        axiosErr?.response?.status === 409 ||
        axiosErr?.response?.data?.duplicate
      ) {
        setErrors({
          catasto: "Esiste già un immobile con questi dati catastali. Verifica i dati inseriti.",
        });
        setSubmitting(false);
        return;
      }
    }

    try {
      await api.post("/api/properties", {
        ...formData,
        status,
        imageCount: imageFiles.length,
        docCount: docFiles.length,
      });
      localStorage.removeItem(DRAFT_KEY);
      router.push("/dashboard/immobili");
    } catch {
      setSubmitError("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Image/doc file handling ──
  const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
  const ALLOWED_DOC_MIME = ["application/pdf"];
  const ALLOWED_DOC_EXT = [".pdf"];

  function isValidImage(file: File): boolean {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ALLOWED_IMAGE_MIME.includes(file.type) && ALLOWED_IMAGE_EXT.includes(ext);
  }

  function isValidDoc(file: File): boolean {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ALLOWED_DOC_MIME.includes(file.type) && ALLOWED_DOC_EXT.includes(ext);
  }

  function handleImageFiles(files: FileList | null) {
    if (!files) return;
    const valid: File[] = [];
    let hasInvalid = false;
    Array.from(files).forEach((f) => {
      if (isValidImage(f)) valid.push(f);
      else hasInvalid = true;
    });
    if (hasInvalid) {
      setFileError(
        "Formato non supportato. Sono accettati solo JPEG, PNG, WebP per le immagini e PDF per i documenti."
      );
    } else {
      setFileError("");
    }
    setImageFiles((prev) => [...prev, ...valid]);
  }

  function handleDocFiles(files: FileList | null) {
    if (!files) return;
    const valid: File[] = [];
    let hasInvalid = false;
    Array.from(files).forEach((f) => {
      if (isValidDoc(f)) valid.push(f);
      else hasInvalid = true;
    });
    if (hasInvalid) {
      setFileError(
        "Formato non supportato. Sono accettati solo JPEG, PNG, WebP per le immagini e PDF per i documenti."
      );
    } else {
      setFileError("");
    }
    setDocFiles((prev) => [...prev, ...valid]);
  }

  // ── Province autocomplete handlers ──
  function handleProvinciaInputChange(val: string) {
    setProvinciaInput(val);
    if (val.length > 0) {
      const filtered = PROVINCE.filter((p) =>
        p.nome.toLowerCase().startsWith(val.toLowerCase())
      ).slice(0, 8);
      setProvinceSuggestions(filtered);
      setShowProvinceSugg(true);
    } else {
      setProvinceSuggestions([]);
      setShowProvinceSugg(false);
      updateField("provinciaCode", "");
      updateField("provincia", "");
      updateField("comune", "");
    }
  }

  function selectProvincia(p: (typeof PROVINCE)[0]) {
    setProvinciaInput(p.nome);
    updateField("provinciaCode", p.codice);
    updateField("provincia", p.nome);
    updateField("comune", "");
    setShowProvinceSugg(false);
    setProvinceSuggestions([]);
  }

  const comuni = formData.provinciaCode
    ? getComuniByProvincia(formData.provinciaCode)
    : [];

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION RENDERERS
  // ─────────────────────────────────────────────────────────────────────────

  function renderBaseInfo() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Titolo */}
        <div>
          <label style={labelStyle}>
            Titolo <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            value={formData.titolo}
            onChange={(e) => updateField("titolo", e.target.value)}
            placeholder="Es. Casale con terreno in Umbria"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.titolo && <p style={errorStyle}>{errors.titolo}</p>}
        </div>

        {/* Descrizione */}
        <div>
          <label style={labelStyle}>Descrizione</label>
          <textarea
            value={formData.descrizione}
            onChange={(e) => updateField("descrizione", e.target.value)}
            placeholder="Descrivi l'immobile..."
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* Tipologia padre */}
        <div>
          <label style={labelStyle}>
            Tipologia <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            value={formData.tipologiaPadre}
            onChange={(e) => {
              updateField("tipologiaPadre", e.target.value);
              updateField("tipologiaFiglio", "");
            }}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">Seleziona categoria</option>
            {Object.keys(TIPOLOGIE).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {errors.tipologiaPadre && <p style={errorStyle}>{errors.tipologiaPadre}</p>}
        </div>

        {/* Tipologia figlia */}
        {formData.tipologiaPadre && (
          <div>
            <label style={labelStyle}>
              Sottotipologia <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              value={formData.tipologiaFiglio}
              onChange={(e) => updateField("tipologiaFiglio", e.target.value)}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Seleziona sottotipologia</option>
              {TIPOLOGIE[formData.tipologiaPadre].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipologiaFiglio && <p style={errorStyle}>{errors.tipologiaFiglio}</p>}
          </div>
        )}

        {/* Tipo contratto */}
        <div>
          <label style={labelStyle}>
            Tipo contratto <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            {(["Vendita", "Affitto"] as const).map((opt) => {
              const active = formData.tipoContratto === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField("tipoContratto", opt)}
                  style={{
                    padding: "9px 28px",
                    border: `2px solid ${active ? GREEN : BORDER}`,
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: active ? GREEN : "#ffffff",
                    color: active ? "#ffffff" : TEXT,
                    cursor: "pointer",
                    transition: "background-color 0.15s, border-color 0.15s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {errors.tipoContratto && <p style={errorStyle}>{errors.tipoContratto}</p>}
        </div>

        {/* Prezzo + valuta */}
        <div>
          <label style={labelStyle}>
            Prezzo <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={formData.prezzo}
              onChange={(e) => updateField("prezzo", e.target.value)}
              placeholder="Es. 350000"
              min={0}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <select
              value={formData.valuta}
              onChange={(e) => updateField("valuta", e.target.value)}
              style={{ ...inputStyle, width: 90, flex: "none" }}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              {["EUR", "USD", "GBP", "CHF"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          {errors.prezzo && <p style={errorStyle}>{errors.prezzo}</p>}
        </div>
      </div>
    );
  }

  function renderCatasto() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Catasto - full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            Inserito nel Catasto <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            value={formData.catasto}
            onChange={(e) =>
              updateField("catasto", e.target.value as "TERRENI" | "FABBRICATI" | "")
            }
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">Seleziona catasto</option>
            <option value="TERRENI">TERRENI</option>
            <option value="FABBRICATI">FABBRICATI</option>
          </select>
          {errors.catasto && <p style={errorStyle}>{errors.catasto}</p>}
        </div>

        {/* Provincia autocomplete */}
        <div style={{ position: "relative" }}>
          <label style={labelStyle}>
            Provincia <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            value={provinciaInput}
            onChange={(e) => handleProvinciaInputChange(e.target.value)}
            onFocus={(e) => {
              onFocus(e);
              if (provinciaInput.length > 0 && provinceSuggestions.length > 0)
                setShowProvinceSugg(true);
            }}
            onBlur={(e) => {
              onBlur(e);
              setTimeout(() => setShowProvinceSugg(false), 150);
            }}
            placeholder="Es. Siena"
            style={inputStyle}
            autoComplete="off"
          />
          {showProvinceSugg && provinceSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#ffffff",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                zIndex: 100,
                maxHeight: 200,
                overflowY: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {provinceSuggestions.map((p) => (
                <div
                  key={p.codice}
                  onMouseDown={() => selectProvincia(p)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 14,
                    borderBottom: `1px solid ${BG}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = BG)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  <strong>{p.nome}</strong>{" "}
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>
                    ({p.codice}) — {p.regione}
                  </span>
                </div>
              ))}
            </div>
          )}
          {errors.provincia && <p style={errorStyle}>{errors.provincia}</p>}
        </div>

        {/* Comune */}
        <div>
          <label style={labelStyle}>
            Comune <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            value={formData.comune}
            onChange={(e) => updateField("comune", e.target.value)}
            disabled={!formData.provinciaCode}
            style={{
              ...inputStyle,
              opacity: !formData.provinciaCode ? 0.5 : 1,
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">
              {formData.provinciaCode ? "Seleziona comune" : "Prima seleziona la provincia"}
            </option>
            {comuni.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.comune && <p style={errorStyle}>{errors.comune}</p>}
        </div>

        {/* Foglio di Mappa */}
        <div>
          <label style={labelStyle}>
            Foglio di Mappa <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="number"
            value={formData.foglioMappa}
            onChange={(e) => updateField("foglioMappa", e.target.value)}
            placeholder="Es. 12"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.foglioMappa && <p style={errorStyle}>{errors.foglioMappa}</p>}
        </div>

        {/* Particella */}
        <div>
          <label style={labelStyle}>
            Particella <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            value={formData.particella}
            onChange={(e) => updateField("particella", e.target.value)}
            placeholder="Es. 345"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.particella && <p style={errorStyle}>{errors.particella}</p>}
        </div>

        {/* Subalterno (solo FABBRICATI) */}
        {formData.catasto === "FABBRICATI" && (
          <div>
            <label style={labelStyle}>Subalterno</label>
            <input
              type="number"
              value={formData.subalterno}
              onChange={(e) => updateField("subalterno", e.target.value)}
              placeholder="Es. 1"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}
      </div>
    );
  }

  function renderDettagli() {
    const fieldConfig = [
      { key: "superficieTotale", label: "Superficie totale (mq)", type: "number" },
      { key: "superficieAbitativa", label: "Superficie abitativa (mq)", type: "number" },
      { key: "superficieTerreno", label: "Superficie terreno (mq)", type: "number" },
      { key: "numLocali", label: "N° locali", type: "number" },
      { key: "numCamere", label: "N° camere", type: "number" },
      { key: "numBagni", label: "N° bagni", type: "number" },
      { key: "piano", label: "Piano (es: T, 1, PT)", type: "text" },
      { key: "annoCostruzione", label: "Anno di costruzione", type: "number" },
    ] as const;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {fieldConfig.map(({ key, label, type }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type}
                value={formData[key] as string}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField(key, e.target.value)
                }
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Stato */}
          <div>
            <label style={labelStyle}>Stato</label>
            <select
              value={formData.stato}
              onChange={(e) => updateField("stato", e.target.value)}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Seleziona</option>
              {["Da ristrutturare", "Buono stato", "Ristrutturato", "Nuovo/Recente"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Classe energetica */}
          <div>
            <label style={labelStyle}>Classe energetica</label>
            <select
              value={formData.classeEnergetica}
              onChange={(e) => updateField("classeEnergetica", e.target.value)}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Seleziona</option>
              {["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G", "Esente"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Riscaldamento */}
          <div>
            <label style={labelStyle}>Riscaldamento</label>
            <select
              value={formData.riscaldamento}
              onChange={(e) => updateField("riscaldamento", e.target.value)}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Seleziona</option>
              {["Autonomo", "Centralizzato", "Assente", "Pompa di calore"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", gap: 32, marginTop: 4 }}>
          {(
            [
              { key: "piscina", label: "Piscina" },
              { key: "garagePostoAuto", label: "Garage/Posto auto" },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                color: TEXT,
              }}
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => updateField(key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: GREEN, cursor: "pointer" }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderGalleria() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {fileError && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {fileError}
          </div>
        )}

        {/* Images drop zone */}
        <div>
          <label style={labelStyle}>Immagini (JPEG, PNG, WebP)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setImgDragOver(true); }}
            onDragLeave={() => setImgDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setImgDragOver(false); handleImageFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("img-upload")?.click()}
            style={{
              border: `2px dashed ${imgDragOver ? GREEN : BORDER}`,
              borderRadius: 8,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: imgDragOver ? "#f0fdf4" : BG,
              transition: "border-color 0.15s, background-color 0.15s",
            }}
          >
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Trascina le immagini qui oppure{" "}
              <span style={{ color: GREEN, fontWeight: 600 }}>sfoglia</span>
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Formati accettati: JPEG, PNG, WebP
            </p>
          </div>
          <input
            id="img-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleImageFiles(e.target.files)}
          />
          {imageFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {imageFiles.map((f, i) => (
                <div key={i} style={{ position: "relative", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    style={{
                      width: 90,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: `1px solid ${BORDER}`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Docs drop zone */}
        <div>
          <label style={labelStyle}>Documenti (PDF)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
            onDragLeave={() => setDocDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDocDragOver(false); handleDocFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("doc-upload")?.click()}
            style={{
              border: `2px dashed ${docDragOver ? GREEN : BORDER}`,
              borderRadius: 8,
              padding: "28px 20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: docDragOver ? "#f0fdf4" : BG,
              transition: "border-color 0.15s, background-color 0.15s",
            }}
          >
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Trascina i PDF qui oppure{" "}
              <span style={{ color: GREEN, fontWeight: 600 }}>sfoglia</span>
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Solo file PDF</p>
          </div>
          <input
            id="doc-upload"
            type="file"
            accept=".pdf"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleDocFiles(e.target.files)}
          />
          {docFiles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {docFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: TEXT }}>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setDocFiles((prev) => prev.filter((_, j) => j !== i))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#dc2626",
                      fontSize: 18,
                      lineHeight: 1,
                      padding: "0 4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video URL */}
        <div>
          <label style={labelStyle}>URL video (YouTube, Vimeo)</label>
          <input
            type="text"
            value={formData.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.videoUrl && <p style={errorStyle}>{errors.videoUrl}</p>}
        </div>

        {/* Tour 360° */}
        <div>
          <label style={labelStyle}>Tour 360° (embed/iframe)</label>
          <textarea
            value={formData.tour360}
            onChange={(e) => updateField("tour360", e.target.value)}
            placeholder='<iframe src="..." ...></iframe>'
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: 13,
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
    );
  }

  function renderPosizione() {
    return (
      <div>
        <APIProvider apiKey={MAPS_KEY}>
          <MapStep
            lat={formData.lat}
            lng={formData.lng}
            onPositionChange={(lat, lng) => {
              updateField("lat", lat);
              updateField("lng", lng);
            }}
          />
        </APIProvider>
        {errors.position && (
          <p style={{ ...errorStyle, marginTop: 8 }}>{errors.position}</p>
        )}
      </div>
    );
  }

  function renderPubblicazione() {
    const canPublish =
      !gateLoading && gateData !== null ? gateData.canPublish : true;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {gateLoading && (
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Verifica autorizzazioni in corso...
          </p>
        )}

        {!gateLoading && gateData && !gateData.canPublish && (
          <div
            style={{
              padding: "16px 18px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
            }}
          >
            <p
              style={{
                fontWeight: 700,
                color: "#dc2626",
                fontSize: 14,
                margin: "0 0 8px",
              }}
            >
              Completa il tuo profilo professionale prima di pubblicare
            </p>
            {gateData.missing.length > 0 && (
              <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 13, color: "#7f1d1d" }}>
                {gateData.missing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
            <a
              href="/dashboard/profilo"
              style={{
                display: "inline-block",
                padding: "8px 18px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Vai al profilo
            </a>
          </div>
        )}

        {/* Summary */}
        <div
          style={{
            backgroundColor: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: TEXT }}>
            Riepilogo annuncio
          </h3>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: "8px 16px",
              fontSize: 14,
              margin: 0,
            }}
          >
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Titolo</dt>
            <dd style={{ margin: 0, color: TEXT }}>{formData.titolo || "—"}</dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Tipologia</dt>
            <dd style={{ margin: 0, color: TEXT }}>
              {formData.tipologiaPadre
                ? `${formData.tipologiaPadre} › ${formData.tipologiaFiglio}`
                : "—"}
            </dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Contratto</dt>
            <dd style={{ margin: 0, color: TEXT }}>{formData.tipoContratto || "—"}</dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Prezzo</dt>
            <dd style={{ margin: 0, color: TEXT }}>
              {formData.prezzo
                ? `${Number(formData.prezzo).toLocaleString("it-IT")} ${formData.valuta}`
                : "—"}
            </dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Catasto</dt>
            <dd style={{ margin: 0, color: TEXT }}>{formData.catasto || "—"}</dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Comune</dt>
            <dd style={{ margin: 0, color: TEXT }}>
              {formData.comune
                ? `${formData.comune} (${formData.provinciaCode})`
                : "—"}
            </dd>
            <dt style={{ fontWeight: 600, color: LABEL_COLOR }}>Posizione</dt>
            <dd style={{ margin: 0, color: TEXT }}>
              {formData.lat !== null
                ? `${formData.lat?.toFixed(5)}, ${formData.lng?.toFixed(5)}`
                : "—"}
            </dd>
          </dl>
        </div>

        {submitError && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {submitError}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
            style={{
              ...btnSecondary,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = BG;
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = "#ffffff";
            }}
          >
            {submitting ? "Salvataggio..." : "Salva come bozza"}
          </button>
          <button
            type="button"
            disabled={submitting || !canPublish}
            onClick={() => handleSubmit("PUBLISHED")}
            style={{
              ...btnPrimary,
              opacity: submitting || !canPublish ? 0.6 : 1,
              cursor: submitting || !canPublish ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!submitting && canPublish)
                e.currentTarget.style.backgroundColor = "#1e8c4a";
            }}
            onMouseLeave={(e) => {
              if (!submitting && canPublish)
                e.currentTarget.style.backgroundColor = GREEN;
            }}
          >
            {submitting ? "Pubblicazione..." : "Pubblica ora"}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, padding: "32px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
          Crea nuovo annuncio
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
          Compila i campi richiesti per pubblicare il tuo immobile su LandRetrieve.
        </p>

        {/* Draft restored banner */}
        {draftBanner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
              color: "#92400e",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>Bozza recuperata automaticamente.</span>
            <button
              type="button"
              onClick={clearDraft}
              style={{
                background: "none",
                border: `1px solid #d97706`,
                borderRadius: 5,
                padding: "4px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "#92400e",
                cursor: "pointer",
              }}
            >
              Elimina bozza
            </button>
          </div>
        )}

        {/* All sections in a single card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          {/* 1. Informazioni di base */}
          <div>
            <SectionHeader title="Informazioni di base" />
            {renderBaseInfo()}
          </div>

          {/* 2. Dati catastali */}
          <div>
            <SectionHeader title="Dati catastali" />
            {renderCatasto()}
          </div>

          {/* 3. Dettagli tecnici */}
          <div>
            <SectionHeader title="Dettagli tecnici" />
            {renderDettagli()}
          </div>

          {/* 4. Galleria e media */}
          <div>
            <SectionHeader title="Galleria e media" />
            {renderGalleria()}
          </div>

          {/* 5. Localizzazione */}
          <div>
            <SectionHeader title="Localizzazione" />
            {renderPosizione()}
          </div>

          <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: 0 }} />

          {/* 6. Pubblicazione */}
          <div>
            <SectionHeader title="Pubblicazione" />
            {renderPubblicazione()}
          </div>
        </div>
      </div>
    </div>
  );
}
