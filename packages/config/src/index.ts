// ─── TAXONOMY CONSTANTS ──────────────────────────────────────────────────────

export const PROPERTY_TYPES = [
  'Ville',
  'Casali',
  'Casali ristrutturati',
  'Casali da ristrutturare',
  'Agriturismi',
  'Aziende agricole',
  'Terreni',
] as const

export type PropertyType = typeof PROPERTY_TYPES[number]

export const PROPERTY_STATUSES = ['Vendita', 'Venduto', 'Nuovo'] as const

export const PROPERTY_LABELS = ['Hot', 'Nuovo', 'Ridotto', 'In Evidenza'] as const

export const PROPERTY_FEATURES = {
  natura: ['Lago privato', 'Fronte mare', 'Spiaggia privata', 'Bosco'],
  attivita: ['Golf', 'Equitazione', 'Caccia', 'Pesca', 'Escursioni', 'Campeggio'],
  utenze: ['Acqua', 'Elettricità', 'Metano', 'Pozzo', 'Edificabile', 'Agricolo'],
  strutture: ['Piscina', 'Vigneto', 'Oliveta', 'Frutteto', 'BBQ', 'Wi-Fi', 'Camino', 'Veranda'],
  terreni: ['Terreni edificabili', 'Terreni coltivati'],
} as const

export const ENERGY_CLASSES = ['A4', 'A3', 'A2', 'A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

// ─── CURRENCIES ──────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'EUR €' },
  { code: 'USD', symbol: '$', label: 'USD $' },
  { code: 'GBP', symbol: '£', label: 'GBP £' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF' },
  { code: 'AUD', symbol: 'A$', label: 'AUD A$' },
] as const

export const AREA_UNITS = ['m²', 'ft²'] as const

export const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

// ─── PRICING ─────────────────────────────────────────────────────────────────

export const PRICING = {
  AGENCY_BASE: 29.90,
  AGENCY_PRO: 59.90,
  AGENT_BASE: 29.90,
  AGENT_PRO: 44.90,
  BADGE_VERIFIED: 4.90,
  FEATURED_LISTING: 5.90,
} as const

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  LIMITS: [10, 25, 50],
} as const

// ─── ROUTES ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  SEARCH: '/cerca',
  PROPERTY: (slug: string) => `/immobili/${slug}`,
  AGENCIES: '/agenzie',
  AGENCY: (slug: string) => `/agenzie/${slug}`,
  AGENTS: '/agenti',
  AGENT: (slug: string) => `/agenti/${slug}`,
  PLANS: '/piani',
  ABOUT: '/chi-siamo',
  CONTACT: '/contatti',
  FAQ: '/faq',
  LOGIN: '/login',
  REGISTER: '/registrati',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  DASHBOARD_PROPERTIES: '/dashboard/immobili',
  DASHBOARD_NEW_PROPERTY: '/dashboard/immobili/nuovo',
  DASHBOARD_PROFILE: '/dashboard/profilo',
  DASHBOARD_MESSAGES: '/dashboard/messaggi',
  DASHBOARD_SUBSCRIPTION: '/dashboard/abbonamento',
} as const

// ─── AGENT POSITIONS ─────────────────────────────────────────────────────────

export const AGENT_POSITIONS = [
  'Agente Junior',
  'Agente Senior',
  'Broker',
  'Property Finder',
  'Team Leader',
  'Titolare',
] as const

// ─── CRM STATUSES ────────────────────────────────────────────────────────────

export const LEAD_STATUSES = [
  { value: 'new', label: 'Nuovo' },
  { value: 'contacted', label: 'Contattato' },
  { value: 'qualified', label: 'Qualificato' },
  { value: 'unqualified', label: 'Non qualificato' },
  { value: 'converted', label: 'Convertito' },
] as const

export const DEAL_STATUSES = [
  { value: 'open', label: 'Aperta' },
  { value: 'negotiating', label: 'In trattativa' },
  { value: 'offer', label: 'Offerta inviata' },
  { value: 'won', label: 'Vinta' },
  { value: 'lost', label: 'Persa' },
] as const

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'Nuovo' },
  { value: 'in_progress', label: 'In gestione' },
  { value: 'replied', label: 'Risposto' },
  { value: 'closed', label: 'Chiuso' },
] as const
