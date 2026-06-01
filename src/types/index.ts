export type GuestCountBracket = '<100' | '100-300' | '300-500' | '500+'
export type VenueType = 'banquet_hall' | 'farmhouse' | 'heritage_property' | 'destination' | 'home'
export type BudgetBracket = '10-25L' | '25-50L' | '50L-1Cr' | '1-2Cr' | '2Cr+'

export interface IntakeFormInput {
  weddingDate: string
  guestCount: GuestCountBracket
  city: string
  venueType: VenueType
  budgetBracket: BudgetBracket
  priorities: [string, string]
}

export interface IntakePlan {
  id: string
  weddingDate: string
  guestCount: GuestCountBracket
  city: string
  venueType: VenueType
  budgetBracket: BudgetBracket
  priorities: string[]
  createdAt: string
  totalBudgetMidpoint: number
}

export interface Recommendation {
  id: string
  planId: string
  category: string
  priorityRank: number | null
  suggestedMin: number
  suggestedMax: number
  allocationPercent: number
  rationale: string
  tips: string[]
  sortOrder: number
}

export interface Payment {
  id: string
  planId: string
  recommendationId: string
  vendorName: string
  amount: number
  paymentDate: string
  notes?: string | null
  createdAt: string
}

export interface BudgetSummaryData {
  totalBudget: number
  totalSpent: number
  balance: number
}

export interface PlanResponse {
  plan: IntakePlan
  recommendations: Recommendation[]
  payments: Payment[]
  summary: BudgetSummaryData
}

export interface PaymentInput {
  planId: string
  recommendationId: string
  vendorName: string
  amount: number
  paymentDate: string
  notes?: string
}

export interface RecommendResponse {
  planId: string
  recommendations: Recommendation[]
}
