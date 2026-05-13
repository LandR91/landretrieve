export type SubscriptionPlan = 'CONNECT' | 'SIGNATURE' | 'ENTERPRISE'
export type BillingCycle = 'MONTHLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING'

export type PlanPrice = {
  plan: SubscriptionPlan
  cycle: BillingCycle
  basePrice: number
  badgeAddonPrice?: number
  featuredListingPrice?: number
  vatIncluded: true
}

export const PLAN_PRICES: PlanPrice[] = [
  { plan: 'CONNECT', cycle: 'MONTHLY', basePrice: 29.90, vatIncluded: true },
  { plan: 'CONNECT', cycle: 'YEARLY', basePrice: 322.92, vatIncluded: true },
  { plan: 'SIGNATURE', cycle: 'MONTHLY', basePrice: 29.90, badgeAddonPrice: 4.90, featuredListingPrice: 7.90, vatIncluded: true },
]
