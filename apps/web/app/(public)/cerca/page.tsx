"use client";

// =============================================================================
// Cerca Page — LandRetrieve.com
// Property search: sticky search bar, split map+results, infinite scroll,
// compare bar with modal.
// =============================================================================

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { Bed, Bath, Maximize2, Leaf, MapPin, X, Plus, BookmarkIcon, LayoutGrid } from "lucide-react";

import api from "@/lib/api";
import { PROVINCE, getComuniByProvincia } from "@/lib/istat";
import { useAuth } from "@/hooks/use-auth";
import { useCompareStore, type CompareItem } from "@/store/compare.store";

// =============================================================================
// Constants
// =============================================================================

const MAPS_KEY = "AIzaSyCXU5OQRShbztd7a-A5_LFwmVkwOdaOYnk";
const GREEN = "#26A55B";
const TEXT = "#111111";
const BG = "#f5f5f5";
const BORDER = "#D4D4D4";
const LABELS = "#374151";
const SEARCH_BAR_HEIGHT = 64;

const TIPOLOGIE: Record<string, string[]> = {
  Terreno: ["Agricolo", "Edificabile", "Boschivo", "Pascolo"],
  "Rurale residenziale": ["Casale", "Cascina", "Masseria", "Trullo", "Baita", "Rustico"],
  "Struttura ricettiva": ["Agriturismo", "Bed & Breakfast", "Albergo", "Rifugio"],
  "Azienda agricola": ["Vitivinicola", "Olivicola", "Zootecnica", "Mista"],
};

// =============================================================================
// Types
// =============================================================================

type PropertyResult = {
  id: string;
  title: string;
  tipologiaPadre: string;
  tipologiaFiglio: string;
  tipoContratto: "VENDITA" | "AFFITTO";
  prezzo: number;
  valuta: string;
  status: string;
  isInPrimoPiano: boolean;
  coverImage?: string;
  lat?: number;
  lng?: number;
  comune?: string;
  provincia?: string;
  superficie?: number;
  superficieTerreno?: number;
  camere?: number;
  bagni?: number;
  annoConstruzione?: number;
  stato?: string;
  piscina?: boolean;
  garage?: boolean;
};

type SearchResponse = {
  data: PropertyResult[];
  total: number;
  hasMore: boolean;
  page: number;
};

type SearchParams = {
  tipo: "vendita" | "affitto";
  dove: string;
  tipologia: string;
  tipologiaFiglio: string;
  prezzoMax: string;
  prezzoMin: string;
  camere: string;
  bagni: string;
  superficieMin: string;
  superficieMax: string;
  terrenoMin: string;
  terrenoMax: string;
  annoMin: string;
  annoMax: string;
  caratteristiche: string[];
  soloInPrimoPiano: boolean;
  provincia: string;
  comune: string;
};

type MapBounds = {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
} | null;

// =============================================================================
// Utility helpers
// =============================================================================

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `€${(price / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }
  if (price >= 1_000) {
    return `€${Math.round(price / 1_000)}k`;
  }
  return `€${price}`;
}

function formatPriceFull(price: number, valuta: string): string {
  const sym = valuta === "EUR" ? "€" : valuta;
  return `${sym}${price.toLocaleString("it-IT")}`;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// =============================================================================
// Input style helpers
// =============================================================================

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    border: `1px solid ${focused ? GREEN : BORDER}`,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
    color: TEXT,
    backgroundColor: "#fff",
    width: "100%",
    transition: "border-color 0.15s",
  };
}

function selectStyle(focused: boolean): React.CSSProperties {
  return {
    ...inputStyle(focused),
    cursor: "pointer",
    appearance: "none" as const,
    paddingRight: 28,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23374151' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };
}

// =============================================================================
// FocusInput — input with green focus border
// =============================================================================

function FocusInput({
  value,
  onChange,
  placeholder,
  type = "text",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), ...style }}
    />
  );
}

// =============================================================================
// FocusSelect
// =============================================================================

function FocusSelect({
  value,
  onChange,
  children,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...selectStyle(focused), ...style }}
    >
      {children}
    </select>
  );
}

// =============================================================================
// LocationAutocomplete — "Dove cerchi?" with dropdown
// =============================================================================

type Suggestion = { label: string; type: "provincia" | "comune"; provincia: string };

function LocationAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const results: Suggestion[] = [];
    for (const p of PROVINCE) {
      if (p.nome.toLowerCase().includes(q)) {
        results.push({ label: `${p.nome} (${p.codice})`, type: "provincia", provincia: p.codice });
      }
    }
    // Import COMUNI lazily via dynamic import is not needed — we have it
    // We'll use a simple filter from the static list
    for (const p of PROVINCE) {
      const comuni = getComuniByProvincia(p.codice);
      for (const c of comuni) {
        if (c.toLowerCase().includes(q)) {
          results.push({ label: `${c}, ${p.nome}`, type: "comune", provincia: p.codice });
        }
      }
    }
    return results.slice(0, 10);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(s: Suggestion) {
    setQuery(s.label);
    onChange(s.label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true); }}
        onBlur={() => setFocused(false)}
        placeholder="Dove cerchi?"
        style={inputStyle(focused)}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxHeight: 240,
            overflowY: "auto",
            marginTop: 4,
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: 14,
                color: TEXT,
                borderBottom: i < suggestions.length - 1 ? `1px solid ${BG}` : "none",
              }}
              onMouseEnter={(e) => ((e.target as HTMLDivElement).style.backgroundColor = BG)}
              onMouseLeave={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#fff")}
            >
              <span style={{ fontSize: 11, color: "#888", marginRight: 6 }}>
                {s.type === "provincia" ? "Provincia" : "Comune"}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SearchBar
// =============================================================================

function SearchBar({
  params,
  onParamsChange,
  onSearch,
  showFilters,
  onToggleFilters,
}: {
  params: SearchParams;
  onParamsChange: (p: Partial<SearchParams>) => void;
  onSearch: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "#fff",
        borderBottom: `1px solid ${BORDER}`,
        height: SEARCH_BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        overflowX: "auto",
      }}
    >
      {/* Contract type tabs */}
      <div style={{ display: "flex", gap: 0, flexShrink: 0 }}>
        {(["vendita", "affitto"] as const).map((t) => {
          const active = params.tipo === t;
          return (
            <button
              key={t}
              onClick={() => onParamsChange({ tipo: t })}
              style={{
                padding: "6px 14px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? GREEN : LABELS,
                borderBottom: active ? `2px solid ${GREEN}` : "2px solid transparent",
              }}
            >
              {t === "vendita" ? "In Vendita" : "In Affitto"}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 32, background: BORDER, flexShrink: 0 }} />

      {/* Location */}
      <LocationAutocomplete
        value={params.dove}
        onChange={(v) => onParamsChange({ dove: v })}
      />

      {/* Tipologia */}
      <div style={{ flexShrink: 0, minWidth: 160 }}>
        <FocusSelect
          value={params.tipologia}
          onChange={(v) => onParamsChange({ tipologia: v, tipologiaFiglio: "" })}
        >
          <option value="">Tipologia</option>
          {Object.keys(TIPOLOGIE).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </FocusSelect>
      </div>

      {/* Prezzo max */}
      <div style={{ flexShrink: 0, minWidth: 120, position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: LABELS, fontSize: 14, pointerEvents: "none" }}>€</span>
        <FocusInput
          type="number"
          value={params.prezzoMax}
          onChange={(v) => onParamsChange({ prezzoMax: v })}
          placeholder="Prezzo max"
          style={{ paddingLeft: 22 }}
        />
      </div>

      {/* Camere */}
      <div style={{ flexShrink: 0, minWidth: 110 }}>
        <FocusSelect value={params.camere} onChange={(v) => onParamsChange({ camere: v })}>
          <option value="">Camere</option>
          {["1", "2", "3", "4", "5"].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </FocusSelect>
      </div>

      {/* Search button */}
      <button
        onClick={onSearch}
        style={{
          flexShrink: 0,
          backgroundColor: GREEN,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "9px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e8f4c")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = GREEN)}
      >
        Cerca
      </button>

      <div style={{ flex: 1 }} />

      {/* Advanced filters toggle */}
      <button
        onClick={onToggleFilters}
        style={{
          flexShrink: 0,
          background: "none",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: "8px 14px",
          fontSize: 14,
          color: LABELS,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = BG)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
      >
        Filtri avanzati {showFilters ? "▲" : "▾"}
      </button>
    </div>
  );
}

// =============================================================================
// AdvancedFilters
// =============================================================================

function AdvancedFilters({
  params,
  onParamsChange,
  onApply,
  onReset,
}: {
  params: SearchParams;
  onParamsChange: (p: Partial<SearchParams>) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const comuniProvincia = useMemo(
    () => (params.provincia ? getComuniByProvincia(params.provincia) : []),
    [params.provincia]
  );

  const CARATTERISTICHE = [
    "Piscina",
    "Garage",
    "Vista panoramica",
    "Giardino",
    "Box auto",
    "Cantina",
  ];

  function toggleCaratteristica(c: string) {
    const cur = params.caratteristiche;
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c];
    onParamsChange({ caratteristiche: next });
  }

  const fieldLabel: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: LABELS,
    marginBottom: 4,
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderBottom: `1px solid ${BORDER}`,
        padding: "20px 24px",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px 24px",
          maxWidth: 1200,
        }}
      >
        {/* Provincia → Comune */}
        <div>
          <label style={fieldLabel}>Provincia</label>
          <FocusSelect
            value={params.provincia}
            onChange={(v) => onParamsChange({ provincia: v, comune: "" })}
          >
            <option value="">Tutte</option>
            {PROVINCE.map((p) => (
              <option key={p.codice} value={p.codice}>
                {p.nome} ({p.codice})
              </option>
            ))}
          </FocusSelect>
        </div>
        <div>
          <label style={fieldLabel}>Comune</label>
          <FocusSelect
            value={params.comune}
            onChange={(v) => onParamsChange({ comune: v })}
          >
            <option value="">Tutti</option>
            {comuniProvincia.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FocusSelect>
        </div>

        {/* Tipologia padre → figlio */}
        <div>
          <label style={fieldLabel}>Tipologia</label>
          <FocusSelect
            value={params.tipologia}
            onChange={(v) => onParamsChange({ tipologia: v, tipologiaFiglio: "" })}
          >
            <option value="">Tutte</option>
            {Object.keys(TIPOLOGIE).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </FocusSelect>
        </div>
        <div>
          <label style={fieldLabel}>Sotto-tipologia</label>
          <FocusSelect
            value={params.tipologiaFiglio}
            onChange={(v) => onParamsChange({ tipologiaFiglio: v })}
          >
            <option value="">Tutte</option>
            {(params.tipologia ? TIPOLOGIE[params.tipologia] ?? [] : []).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </FocusSelect>
        </div>

        {/* Prezzo min/max */}
        <div>
          <label style={fieldLabel}>Prezzo min / max</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: LABELS, fontSize: 13, pointerEvents: "none" }}>€</span>
              <FocusInput type="number" value={params.prezzoMin} onChange={(v) => onParamsChange({ prezzoMin: v })} placeholder="Min" style={{ paddingLeft: 20 }} />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: LABELS, fontSize: 13, pointerEvents: "none" }}>€</span>
              <FocusInput type="number" value={params.prezzoMax} onChange={(v) => onParamsChange({ prezzoMax: v })} placeholder="Max" style={{ paddingLeft: 20 }} />
            </div>
          </div>
        </div>

        {/* Superficie min/max */}
        <div>
          <label style={fieldLabel}>Superficie min / max (mq)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <FocusInput type="number" value={params.superficieMin} onChange={(v) => onParamsChange({ superficieMin: v })} placeholder="Min" />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <FocusInput type="number" value={params.superficieMax} onChange={(v) => onParamsChange({ superficieMax: v })} placeholder="Max" />
            </div>
          </div>
        </div>

        {/* Terreno min/max */}
        <div>
          <label style={fieldLabel}>Terreno min / max (ha)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <FocusInput type="number" value={params.terrenoMin} onChange={(v) => onParamsChange({ terrenoMin: v })} placeholder="Min" />
            <FocusInput type="number" value={params.terrenoMax} onChange={(v) => onParamsChange({ terrenoMax: v })} placeholder="Max" />
          </div>
        </div>

        {/* Camere */}
        <div>
          <label style={fieldLabel}>Camere</label>
          <FocusSelect value={params.camere} onChange={(v) => onParamsChange({ camere: v })}>
            <option value="">Qualsiasi</option>
            {["1", "2", "3", "4", "5"].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </FocusSelect>
        </div>

        {/* Bagni */}
        <div>
          <label style={fieldLabel}>Bagni</label>
          <FocusSelect value={params.bagni} onChange={(v) => onParamsChange({ bagni: v })}>
            <option value="">Qualsiasi</option>
            {["1", "2", "3"].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </FocusSelect>
        </div>

        {/* Anno costruzione */}
        <div>
          <label style={fieldLabel}>Anno costruzione min / max</label>
          <div style={{ display: "flex", gap: 8 }}>
            <FocusInput type="number" value={params.annoMin} onChange={(v) => onParamsChange({ annoMin: v })} placeholder="Da" />
            <FocusInput type="number" value={params.annoMax} onChange={(v) => onParamsChange({ annoMax: v })} placeholder="A" />
          </div>
        </div>

        {/* Caratteristiche */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={fieldLabel}>Caratteristiche</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
            {CARATTERISTICHE.map((c) => (
              <label key={c} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: LABELS }}>
                <input
                  type="checkbox"
                  checked={params.caratteristiche.includes(c)}
                  onChange={() => toggleCaratteristica(c)}
                  style={{ accentColor: GREEN, width: 15, height: 15 }}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Solo in primo piano */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: LABELS }}>
            <input
              type="checkbox"
              checked={params.soloInPrimoPiano}
              onChange={(e) => onParamsChange({ soloInPrimoPiano: e.target.checked })}
              style={{ accentColor: GREEN, width: 15, height: 15 }}
            />
            <strong>Solo In Primo Piano</strong>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          onClick={onApply}
          style={{
            backgroundColor: GREEN,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e8f4c")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = GREEN)}
        >
          Applica filtri
        </button>
        <button
          onClick={onReset}
          style={{
            backgroundColor: "#fff",
            color: LABELS,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "10px 24px",
            fontSize: 14,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = BG)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff")}
        >
          Azzera
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// PriceMarker — map overlay marker component
// =============================================================================

function PriceMarker({
  property,
  highlighted,
  onClick,
}: {
  property: PropertyResult;
  highlighted: boolean;
  onClick: () => void;
}) {
  if (property.lat === undefined || property.lng === undefined) return null;
  return (
    <AdvancedMarker
      position={{ lat: property.lat, lng: property.lng }}
      onClick={onClick}
    >
      <div
        style={{
          backgroundColor: highlighted ? GREEN : "#fff",
          color: highlighted ? "#fff" : TEXT,
          border: `1.5px solid ${highlighted ? GREEN : BORDER}`,
          borderRadius: 12,
          padding: "4px 8px",
          fontSize: highlighted ? 13 : 12,
          fontWeight: 700,
          whiteSpace: "nowrap",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {formatPrice(property.prezzo)}
      </div>
    </AdvancedMarker>
  );
}

// =============================================================================
// MapContent — inner component that uses useMap()
// =============================================================================

function MapContent({
  properties,
  highlightedId,
  onMarkerClick,
  onBoundsChange,
}: {
  properties: PropertyResult[];
  highlightedId: string | null;
  onMarkerClick: (id: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMap();

  const visibleMarkers = useMemo(() => {
    const withCoords = properties.filter(
      (p) => p.lat !== undefined && p.lng !== undefined
    );
    // At low zoom, cap at 50 markers to avoid performance issues
    if (withCoords.length > 50) {
      return withCoords.slice(0, 50);
    }
    return withCoords;
  }, [properties]);

  // Handle camera change to update bounds
  const handleCameraChange = useCallback(() => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    onBoundsChange({
      ne: { lat: ne.lat(), lng: ne.lng() },
      sw: { lat: sw.lat(), lng: sw.lng() },
    });
  }, [map, onBoundsChange]);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("idle", handleCameraChange);
    return () => listener.remove();
  }, [map, handleCameraChange]);

  return (
    <>
      {visibleMarkers.map((p) => (
        <PriceMarker
          key={p.id}
          property={p}
          highlighted={highlightedId === p.id}
          onClick={() => onMarkerClick(p.id)}
        />
      ))}
    </>
  );
}

// =============================================================================
// PropertyCard
// =============================================================================

function PropertyCard({
  property,
  onHighlight,
  isHighlighted,
  cardRef,
}: {
  property: PropertyResult;
  onHighlight: (id: string | null) => void;
  isHighlighted: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { add, remove, has } = useCompareStore();
  const inCompare = has(property.id);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await api.post(`/api/favorites/${property.id}`);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation();
    if (inCompare) {
      remove(property.id);
    } else {
      add({
        id: property.id,
        title: property.title,
        prezzo: property.prezzo,
        valuta: property.valuta,
        coverImage: property.coverImage,
      });
    }
  }

  function handleCardClick() {
    router.push(`/immobili/${property.id}`);
  }

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => onHighlight(property.id)}
      onMouseLeave={() => onHighlight(null)}
      style={{
        backgroundColor: "#fff",
        borderRadius: 8,
        border: `1.5px solid ${isHighlighted ? GREEN : BORDER}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        {property.coverImage ? (
          <img
            src={property.coverImage}
            alt={property.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #26A55B 0%, #1a7a42 100%)",
            }}
          />
        )}

        {/* Tipologia tag */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "#fff",
            borderRadius: 4,
            padding: "3px 8px",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {property.tipologiaFiglio || property.tipologiaPadre}
        </div>

        {/* Action buttons */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compare */}
          <button
            onClick={handleCompare}
            title="Confronta"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              backgroundColor: inCompare ? GREEN : "#fff",
              color: inCompare ? "#fff" : TEXT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!inCompare) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              if (!inCompare) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff";
            }}
          >
            <LayoutGrid size={15} />
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            title="Salva"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#fff",
              color: TEXT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff")}
          >
            <BookmarkIcon size={15} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "12px 14px" }}>
        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
            {formatPriceFull(property.prezzo, property.valuta)}
          </span>
          {property.isInPrimoPiano && (
            <span
              style={{
                backgroundColor: "#F59E0B",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                padding: "2px 7px",
                letterSpacing: "0.5px",
              }}
            >
              IPP
            </span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: TEXT,
            marginBottom: 6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {property.title}
        </div>

        {/* Location */}
        {(property.comune || property.provincia) && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#888", marginBottom: 8 }}>
            <MapPin size={12} />
            <span>{[property.comune, property.provincia].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Icons row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(property.camere ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: LABELS }}>
              <Bed size={13} /> {property.camere}
            </span>
          )}
          {(property.bagni ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: LABELS }}>
              <Bath size={13} /> {property.bagni}
            </span>
          )}
          {(property.superficie ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: LABELS }}>
              <Maximize2 size={13} /> {property.superficie} mq
            </span>
          )}
          {(property.superficieTerreno ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: LABELS }}>
              <Leaf size={13} /> {((property.superficieTerreno ?? 0) / 10000).toFixed(2)} ha
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CompareModal
// =============================================================================

function CompareModal({ onClose }: { onClose: () => void }) {
  const { items } = useCompareStore();

  const ROWS: { label: string; key: keyof CompareItem | string }[] = [
    { label: "Foto", key: "coverImage" },
    { label: "Prezzo", key: "prezzo" },
    { label: "Titolo", key: "title" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 32,
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: LABELS,
          }}
        >
          <X size={22} />
        </button>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 24 }}>
          Confronta immobili
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${items.length}, 1fr)`,
            gap: 16,
          }}
        >
          {items.map((item) => (
            <div key={item.id}>
              {/* Foto */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: LABELS, display: "block", marginBottom: 4 }}>Foto</span>
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 140, borderRadius: 6, background: "linear-gradient(135deg, #26A55B 0%, #1a7a42 100%)" }} />
                )}
              </div>

              {/* Prezzo */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: LABELS, display: "block", marginBottom: 2 }}>Prezzo</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{formatPriceFull(item.prezzo, item.valuta)}</span>
              </div>

              {/* Titolo */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: LABELS, display: "block", marginBottom: 2 }}>Titolo</span>
                <span style={{ fontSize: 14, color: TEXT }}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CompareBar
// =============================================================================

function CompareBar() {
  const { items, remove, clear } = useCompareStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (items.length === 0) return null;

  const emptySlots = 3 - items.length;

  return (
    <>
      {modalOpen && <CompareModal onClose={() => setModalOpen(false)} />}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#fff",
          borderTop: `1px solid ${BORDER}`,
          height: 80,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: LABELS, flexShrink: 0 }}>
          Confronta:
        </span>

        {/* Filled slots */}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "6px 10px",
              backgroundColor: BG,
              maxWidth: 200,
            }}
          >
            {item.coverImage ? (
              <img src={item.coverImage} alt={item.title} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 4, background: "linear-gradient(135deg, #26A55B 0%, #1a7a42 100%)" }} />
            )}
            <span style={{ fontSize: 12, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>
              {item.title}
            </span>
            <button
              onClick={() => remove(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0, marginLeft: 2, display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 160,
              height: 48,
              border: `1.5px dashed ${BORDER}`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
              fontSize: 12,
            }}
          >
            <Plus size={16} style={{ marginRight: 4 }} />
            Slot vuoto
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={clear}
          style={{
            background: "none",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 13,
            color: LABELS,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = BG)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
        >
          Azzera
        </button>

        <button
          onClick={() => items.length >= 2 && setModalOpen(true)}
          disabled={items.length < 2}
          style={{
            backgroundColor: items.length >= 2 ? GREEN : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "9px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: items.length >= 2 ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => { if (items.length >= 2) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e8f4c"; }}
          onMouseLeave={(e) => { if (items.length >= 2) (e.currentTarget as HTMLButtonElement).style.backgroundColor = GREEN; }}
        >
          Confronta →
        </button>
      </div>
    </>
  );
}

// =============================================================================
// Default search params
// =============================================================================

const DEFAULT_PARAMS: SearchParams = {
  tipo: "vendita",
  dove: "",
  tipologia: "",
  tipologiaFiglio: "",
  prezzoMax: "",
  prezzoMin: "",
  camere: "",
  bagni: "",
  superficieMin: "",
  superficieMax: "",
  terrenoMin: "",
  terrenoMax: "",
  annoMin: "",
  annoMax: "",
  caratteristiche: [],
  soloInPrimoPiano: false,
  provincia: "",
  comune: "",
};

// =============================================================================
// Main Page
// =============================================================================

export default function CercaPage() {
  const router = useRouter();

  // Search params
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [committedParams, setCommittedParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [showFilters, setShowFilters] = useState(false);
  const [filterHeight, setFilterHeight] = useState(0);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Results
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds>(null);

  // UI
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Infinite scroll sentinel
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  // Compare store items count (to pad results panel bottom)
  const compareItems = useCompareStore((s) => s.items);

  // ---------------------------------------------------------------------------
  // Build API query params
  // ---------------------------------------------------------------------------
  function buildQuery(p: SearchParams, pg: number, bounds: MapBounds) {
    const q: Record<string, string> = {
      tipo: p.tipo,
      page: String(pg),
      limit: "20",
    };
    if (p.dove) q.dove = p.dove;
    if (p.tipologia) q.tipologia = p.tipologia;
    if (p.tipologiaFiglio) q.tipologiaFiglio = p.tipologiaFiglio;
    if (p.prezzoMin) q.prezzoMin = p.prezzoMin;
    if (p.prezzoMax) q.prezzoMax = p.prezzoMax;
    if (p.camere) q.camere = p.camere;
    if (p.bagni) q.bagni = p.bagni;
    if (p.superficieMin) q.superficieMin = p.superficieMin;
    if (p.superficieMax) q.superficieMax = p.superficieMax;
    if (p.terrenoMin) q.terrenoMin = p.terrenoMin;
    if (p.terrenoMax) q.terrenoMax = p.terrenoMax;
    if (p.annoMin) q.annoMin = p.annoMin;
    if (p.annoMax) q.annoMax = p.annoMax;
    if (p.caratteristiche.length > 0) q.caratteristiche = p.caratteristiche.join(",");
    if (p.soloInPrimoPiano) q.soloInPrimoPiano = "true";
    if (p.provincia) q.provincia = p.provincia;
    if (p.comune) q.comune = p.comune;
    if (bounds) {
      q.bounds = `${bounds.ne.lat},${bounds.ne.lng},${bounds.sw.lat},${bounds.sw.lng}`;
    }
    return q;
  }

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------
  const fetchResults = useCallback(
    async (p: SearchParams, pg: number, bounds: MapBounds, append: boolean) => {
      setLoading(true);
      try {
        const resp = await api.get<SearchResponse>("/api/properties/search", {
          params: buildQuery(p, pg, bounds),
        });
        const data = resp.data;
        if (append) {
          setResults((prev) => [...prev, ...data.data]);
        } else {
          setResults(data.data);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(data.page);
      } catch {
        if (!append) {
          setResults([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchResults(committedParams, 1, mapBounds, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when committed params change (immediate) or bounds change (debounced via map idle)
  const prevCommittedRef = useRef(committedParams);
  useEffect(() => {
    if (prevCommittedRef.current === committedParams) return;
    prevCommittedRef.current = committedParams;
    fetchResults(committedParams, 1, mapBounds, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedParams]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchResults(committedParams, page + 1, mapBounds, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Filter panel height for map offset
  useEffect(() => {
    if (filtersRef.current) {
      setFilterHeight(showFilters ? filtersRef.current.offsetHeight : 0);
    }
  }, [showFilters]);

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------
  function handleParamsChange(partial: Partial<SearchParams>) {
    setParams((prev) => ({ ...prev, ...partial }));
  }

  function handleSearch() {
    setCommittedParams(params);
  }

  function handleApplyFilters() {
    setCommittedParams(params);
    setShowFilters(false);
  }

  function handleResetFilters() {
    setParams(DEFAULT_PARAMS);
    setCommittedParams(DEFAULT_PARAMS);
    setShowFilters(false);
  }

  function handleMarkerClick(id: string) {
    setHighlightedId(id);
    const el = cardRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function handleBoundsChange(bounds: MapBounds) {
    setMapBounds(bounds);
    // Re-fetch with new bounds (debounced via map idle event)
    fetchResults(committedParams, 1, bounds, false);
  }

  const stickyTop = SEARCH_BAR_HEIGHT + filterHeight;
  const mapHeight = `calc(100vh - ${stickyTop}px)`;
  const compareBarOffset = compareItems.length > 0 ? 80 : 0;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Search bar */}
      <SearchBar
        params={params}
        onParamsChange={handleParamsChange}
        onSearch={handleSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
      />

      {/* Advanced filters */}
      {showFilters && (
        <div ref={filtersRef}>
          <AdvancedFilters
            params={params}
            onParamsChange={handleParamsChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>
      )}

      {/* Main content: Map + Results */}
      <div style={{ display: "flex", height: mapHeight, overflow: "hidden" }}>
        {/* MAP — left 40% */}
        <div
          style={{
            width: "40%",
            position: "sticky",
            top: stickyTop,
            height: mapHeight,
            flexShrink: 0,
          }}
        >
          <APIProvider apiKey={MAPS_KEY}>
            <GoogleMap
              defaultCenter={{ lat: 42.5, lng: 12.5 }}
              defaultZoom={6}
              mapId="landretrieve-map"
              style={{ width: "100%", height: "100%" }}
              gestureHandling="greedy"
            >
              <MapContent
                properties={results}
                highlightedId={highlightedId}
                onMarkerClick={handleMarkerClick}
                onBoundsChange={handleBoundsChange}
              />
            </GoogleMap>
          </APIProvider>
        </div>

        {/* RESULTS — right 60% */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: compareBarOffset + 16,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: BG,
              borderBottom: `1px solid ${BORDER}`,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
              {total} annunci trovati
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>
              Ordinamento: Agenzie/Agenti con badge · più visitati
            </span>
          </div>

          {/* Cards grid */}
          <div
            style={{
              padding: 16,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {results.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onHighlight={setHighlightedId}
                isHighlighted={highlightedId === prop.id}
                cardRef={(el) => {
                  if (el) cardRefs.current.set(prop.id, el);
                  else cardRefs.current.delete(prop.id);
                }}
              />
            ))}
          </div>

          {/* Empty state */}
          {!loading && results.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "#888",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: LABELS, marginBottom: 8 }}>
                Nessun risultato trovato
              </div>
              <div style={{ fontSize: 14 }}>
                Prova a modificare i filtri di ricerca
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: `3px solid ${BORDER}`,
                  borderTopColor: GREEN,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* Compare bar */}
      <CompareBar />

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
