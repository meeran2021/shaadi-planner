import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'
import { bracketToMidpoint } from '@/src/lib/currency'
import type { BudgetBracket } from '@/src/types'
// totalAllocated intentionally removed — sum of suggested_max values can exceed
// total budget and confuses users; Spent vs Balance is the relevant signal.

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const [planResult, recsResult, paymentsResult] = await Promise.all([
    supabase.from('intake_forms').select('*').eq('id', id).single(),
    supabase.from('recommendations').select('*').eq('plan_id', id).order('sort_order'),
    supabase.from('payments').select('*').eq('plan_id', id).order('created_at'),
  ])

  if (planResult.error || !planResult.data) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const plan         = planResult.data
  const recommendations = recsResult.data ?? []
  const payments        = paymentsResult.data ?? []

  const totalBudget = bracketToMidpoint(plan.budget_bracket as BudgetBracket)
  const totalSpent  = payments.reduce((s, p) => s + p.amount, 0)

  return NextResponse.json({
    plan: {
      id:                 plan.id,
      weddingDate:        plan.wedding_date,
      guestCount:         plan.guest_count,
      city:               plan.city,
      venueType:          plan.venue_type,
      budgetBracket:      plan.budget_bracket,
      priorities:         plan.priorities,
      createdAt:          plan.created_at,
      totalBudgetMidpoint: totalBudget,
    },
    recommendations: recommendations.map(r => ({
      id:                r.id,
      planId:            r.plan_id,
      category:          r.category,
      priorityRank:      r.priority_rank,
      suggestedMin:      r.suggested_min,
      suggestedMax:      r.suggested_max,
      allocationPercent: Number(r.allocation_percent),
      rationale:         r.rationale,
      tips:              r.tips,
      sortOrder:         r.sort_order,
    })),
    payments: payments.map(p => ({
      id:               p.id,
      planId:           p.plan_id,
      recommendationId: p.recommendation_id,
      vendorName:       p.vendor_name,
      amount:           p.amount,
      paymentDate:      p.payment_date,
      notes:            p.notes,
      createdAt:        p.created_at,
    })),
    summary: {
      totalBudget,
      totalSpent,
      balance: totalBudget - totalSpent,
    },
  })
}
