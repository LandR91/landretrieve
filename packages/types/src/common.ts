export type Locale = 'it' | 'en' | 'de' | 'fr' | 'es' | 'pt' | 'nl' | 'pl' | 'cs' | 'ro' | 'hu' | 'sv' | 'da' | 'fi' | 'el' | 'hr' | 'sk' | 'bg' | 'ar' | 'zh' | 'ja' | 'ru'

export const LOCALES: Locale[] = ['it', 'en', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'cs', 'ro', 'hu', 'sv', 'da', 'fi', 'el', 'hr', 'sk', 'bg', 'ar', 'zh', 'ja', 'ru']

export const RTL_LOCALES: Locale[] = ['ar']

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}
