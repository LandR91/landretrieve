export type PropertyCategory = 'VILLA' | 'CASALE' | 'AGRITURISMO' | 'AZIENDA_AGRICOLA' | 'TERRENO' | 'APPARTAMENTO' | 'ALTRO'
export type ListingType = 'SALE' | 'RENT'
export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SOLD' | 'RENTED'
export type CatasterType = 'TERRENI' | 'FABBRICATI'

export type PropertyFilters = {
  listingType?: ListingType
  category?: PropertyCategory
  region?: string
  province?: string
  priceMin?: number
  priceMax?: number
  surfaceMin?: number
  surfaceMax?: number
  bedrooms?: number
  bathrooms?: number
  hectaresMin?: number
  hectaresMax?: number
  features?: string[]
  page?: number
  limit?: number
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'surface_desc'
}
