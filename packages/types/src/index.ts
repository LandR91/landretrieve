// ─── RE-EXPORT PRISMA TYPES ─────────────────────────────────────────────────
export type {
  User,
  AgencyProfile,
  AgentProfile,
  Property,
  PropertyImage,
  PropertyFeature,
  FloorPlan,
  PropertyAttachment,
  CrmLead,
  CrmDeal,
  CrmEnquiry,
  CrmNote,
  CrmActivity,
  Thread,
  Message,
  Subscription,
  Invoice,
  FeaturedListing,
  Insight,
  Review,
  SavedProperty,
  SavedSearch,
  CustomField,
} from '@prisma/client'

export {
  UserRole,
  ListingType,
  PropertyStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client'

// ─── API RESPONSE TYPES ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

// ─── AUTH TYPES ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// ─── PROPERTY SEARCH TYPES ───────────────────────────────────────────────────

export interface PropertySearchFilters {
  listingType?: 'SALE' | 'RENT' | 'AUCTION'
  propertyType?: string
  country?: string
  city?: string
  area?: string
  priceMin?: number
  priceMax?: number
  sizeMin?: number
  sizeMax?: number
  landSizeMin?: number
  landSizeMax?: number
  bedrooms?: number
  bathrooms?: number
  yearBuiltMin?: number
  yearBuiltMax?: number
  features?: string[]
  isFeatured?: boolean
  radius?: number
  lat?: number
  lng?: number
  query?: string
  page?: number
  limit?: number
  sort?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'featured'
}

export interface MapMarker {
  id: string
  slug: string
  lat: number
  lng: number
  price: number | null
  currency: string
  propertyType: string | null
  title: string
  thumbnail: string | null
}

// ─── DASHBOARD TYPES ─────────────────────────────────────────────────────────

export interface DashboardStats {
  activeListings: number
  totalViews: number
  enquiriesReceived: number
  savedProperties?: number
  teamAgents?: number
}

// ─── PAYMENT TYPES ───────────────────────────────────────────────────────────

export type PlanType = 'BASE' | 'PRO' | 'ENTERPRISE'
export type BillingCycle = 'monthly' | 'annual'
export type UserType = 'AGENCY' | 'AGENT'

export interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  billingCycle: BillingCycle
  stripePriceId: string
  features: string[]
  maxListings: number | null
}

// ─── NOTIFICATION TYPES ───────────────────────────────────────────────────────

export interface Notification {
  id: string
  type:
    | 'new_enquiry'
    | 'new_message'
    | 'listing_published'
    | 'listing_expired'
    | 'subscription_expiring'
  message: string
  isRead: boolean
  createdAt: Date
  meta?: Record<string, unknown>
}

// ─── CONTACT FORM TYPES ───────────────────────────────────────────────────────

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
  propertyId?: string
  agentId?: string
  agencyId?: string
}

export interface ScheduleTourData {
  name: string
  email: string
  phone?: string
  date: string
  time?: string
  propertyId: string
  message?: string
}
