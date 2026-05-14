// ─── Shared Types for LandRetrieve.com ───────────────────────────────────────

export type UserRole = "ADMIN" | "AGENCY" | "AGENT" | "VISITOR";
export type UserTitle = "SIG" | "SIGRA";
export type ListingType = "SALE" | "RENT";
export type PropertyStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "EXPIRED" | "SOLD";
export type PropertyTypeParent = "VILLE" | "AGRITURISMI" | "AZIENDE_AGRICOLE" | "CASALE" | "TERRENO";
export type SubscriptionPlan = "CONNECT" | "SIGNATURE" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "CANCELLED" | "EXPIRED" | "TRIALING";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
export type CatasterType = "TERRENI" | "FABBRICATI";

// ─── Property Types ───────────────────────────────────────────────────────────

export const PROPERTY_TYPE_CHILDREN: Record<PropertyTypeParent, string[]> = {
  VILLE: [],
  AGRITURISMI: [],
  AZIENDE_AGRICOLE: [],
  CASALE: ["Casale ristrutturato", "Casale da ristrutturare"],
  TERRENO: ["Terreno coltivato", "Terreno non coltivato", "Terreno edificabile"],
};

export const PROPERTY_LABELS = ["Hot", "Nuovo", "Ridotto", "In Primo Piano"] as const;
export type PropertyLabel = (typeof PROPERTY_LABELS)[number];

export const PROPERTY_FEATURES = {
  Natura: ["Lago privato", "Fronte mare", "Spiaggia privata", "Bosco"],
  Attività: ["Golf", "Equitazione", "Caccia", "Pesca", "Escursioni", "Campeggio"],
  Utenze: ["Acqua", "Elettricità", "Metano", "Pozzo", "Edificabile", "Agricolo"],
  Strutture: ["Piscina", "Vigneto", "Oliveta", "Frutteto", "BBQ", "Wi-Fi", "Camino", "Veranda"],
} as const;

// ─── Subscription Pricing ─────────────────────────────────────────────────────

export const PRICING = {
  CONNECT_MONTHLY: 29.9,
  CONNECT_YEARLY: 322.92,
  CONNECT_YEARLY_DISCOUNT: 0.1,
  BADGE_MONTHLY: 4.9,
  FEATURED_MONTHLY: 7.9,
  SIGNATURE_YEARLY_DISCOUNT: 0.12,
} as const;

// ─── Supported Languages ──────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = [
  "it", "en-US", "es", "pt", "de", "fr",
  "zh-CN", "zh-TW", "ja", "ko",
  "ar", "hi", "id", "ms", "tr", "el",
  "sv", "nl", "pl", "ro", "sq",
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "it";
export const RTL_LOCALES: SupportedLocale[] = ["ar"];

// ─── File Upload ──────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const ALLOWED_DOC_TYPES = ["application/pdf"] as const;
export const ALLOWED_VIDEO_PROTOCOLS = ["youtube.com", "youtu.be", "vimeo.com"] as const;

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Design System ────────────────────────────────────────────────────────────

export const DESIGN_TOKENS = {
  colors: {
    green: "#26A55B",
    greenDark: "#1d8a4b",
    greenLight: "#e8f7ef",
    greenXlight: "#f0fbf5",
    greenAccessible: "#1a7a42",
    border: "#D4D4D4",
    footerBg: "#CACACA",
    text: "#111111",
    textSoft: "#374151",
    muted: "#4b5563",
    light: "#f5f5f5",
    dark1: "#0a1f12",
    dark2: "#0f2a1a",
    dark3: "#1a4a2e",
  },
  nav: {
    height: "72px",
    maxWidth: "1200px",
  },
} as const;
