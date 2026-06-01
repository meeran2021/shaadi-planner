import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/src/lib/supabase'

const AddCategorySchema = z.object({
  planId:      z.string().uuid(),
  category:    z.string().min(2).max(100),
  suggestedMin: z.number().positive(),
  suggestedMax: z.number().positive(),
  rationale:   z.string().max(500).optional(),
}).refine(d => d.suggestedMax >= d.suggestedMin, {
  message: 'Max must be ≥ min',
  path:    ['suggestedMax'],
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = AddCategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) },
      { status: 400 }
    )
  }

  const { planId, category, suggestedMin, suggestedMax, rationale } = parsed.data

  const { data: last } = await supabase
    .from('recommendations')
    .select('sort_order')
    .eq('plan_id', planId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = ((last?.sort_order ?? -1) as number) + 1

  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      plan_id:           planId,
      category,
      priority_rank:     null,
      suggested_min:     Math.round(suggestedMin),
      suggested_max:     Math.round(suggestedMax),
      allocation_percent: 0,
      rationale:         rationale ?? '',
      tips:              [],
      sort_order:        sortOrder,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[POST /api/category]', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }

  return NextResponse.json({
    id:                data.id,
    planId:            data.plan_id,
    category:          data.category,
    priorityRank:      data.priority_rank,
    suggestedMin:      data.suggested_min,
    suggestedMax:      data.suggested_max,
    allocationPercent: Number(data.allocation_percent),
    rationale:         data.rationale,
    tips:              data.tips,
    sortOrder:         data.sort_order,
  }, { status: 201 })
}
