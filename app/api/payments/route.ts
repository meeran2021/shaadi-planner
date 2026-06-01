import { NextRequest, NextResponse } from 'next/server'
import { PaymentSchema } from '@/src/lib/validation'
import { supabase } from '@/src/lib/supabase'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = PaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      plan_id:           parsed.data.planId,
      recommendation_id: parsed.data.recommendationId,
      vendor_name:       parsed.data.vendorName,
      amount:            parsed.data.amount,
      payment_date:      parsed.data.paymentDate,
      notes:             parsed.data.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Plan or category not found' }, { status: 404 })
    }
    console.error('[/api/payments] DB insert:', error)
    return NextResponse.json({ error: 'Failed to save payment' }, { status: 500 })
  }

  return NextResponse.json(
    {
      id:               data.id,
      planId:           data.plan_id,
      recommendationId: data.recommendation_id,
      vendorName:       data.vendor_name,
      amount:           data.amount,
      paymentDate:      data.payment_date,
      notes:            data.notes,
      createdAt:        data.created_at,
    },
    { status: 201 }
  )
}
