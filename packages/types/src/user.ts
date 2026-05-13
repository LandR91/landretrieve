export type UserRole = 'BUYER' | 'AGENT' | 'AGENCY' | 'ADMIN'

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  country?: string
  locale: string
  createdAt: string
}
