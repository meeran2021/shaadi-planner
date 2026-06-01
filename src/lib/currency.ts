import type { BudgetBracket } from '@/src/types'

const BRACKET_MIDPOINTS: Record<BudgetBracket, number> = {
  '10-25L':  1_750_000,
  '25-50L':  3_750_000,
  '50L-1Cr': 7_500_000,
  '1-2Cr':  15_000_000,
  '2Cr+':   30_000_000,
}

export function bracketToMidpoint(bracket: BudgetBracket): number {
  return BRACKET_MIDPOINTS[bracket]
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(1)}L`
  if (amount >= 1_000)      return `₹${(amount / 1_000).toFixed(0)}K`
  return `₹${amount}`
}
