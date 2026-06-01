import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/src/lib/supabase'

export const dynamic = 'force-dynamic'

const UpdateSchema = z.object({
  suggestedMin: z.number().positive(),
  suggestedMax: z.number().positive(),
}).refine(d => d.suggestedMax >= d.suggestedMin, {
  message: 'Max must be ≥ min',
  path:    ['suggestedMax'],
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('recommendations')
    .update({
      suggested_min: Math.round(parsed.data.suggestedMin),
      suggested_max: Math.round(parsed.data.suggestedMax),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error || !data) {
    console.error('[PATCH /api/category]', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // payments.recommendation_id has ON DELETE CASCADE, so this auto-deletes payments too
  const { error } = await supabase
    .from('recommendations')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[DELETE /api/category]', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
