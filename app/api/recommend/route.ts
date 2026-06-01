import { NextRequest } from 'next/server'
import { IntakeSchema } from '@/src/lib/validation'
import { getRecommendations } from '@/src/lib/gemini'
import { supabase } from '@/src/lib/supabase'

const STATUS_MESSAGES = (city: string) => [
  `Researching vendor costs in ${city}…`,
  'Calculating budget allocations per category…',
  'Prioritising your top choices…',
  'Finalising your personalised plan…',
]

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const parsed = IntakeSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        errors: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const intake = parsed.data as typeof parsed.data & { priorities: [string, string] }

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* controller already closed */ }
      }

      const close = () => {
        if (!closed) { closed = true; controller.close() }
      }

      // Drip status messages every 2.5 s while AI call runs in the background
      const statusMsgs = STATUS_MESSAGES(intake.city)
      let si = 0
      const ticker = setInterval(() => {
        if (si < statusMsgs.length) send({ type: 'status', message: statusMsgs[si++] })
        else clearInterval(ticker)
      }, 2500)

      try {
        send({ type: 'status', message: 'Analysing your wedding details…' })

        let recommendations: Awaited<ReturnType<typeof getRecommendations>>
        try {
          recommendations = await getRecommendations(intake)
        } catch (err) {
          clearInterval(ticker)
          console.error('[/api/recommend] Gemini error:', err)
          send({ type: 'error', message: 'Failed to generate recommendations. Please try again.' })
          return
        }

        clearInterval(ticker)
        send({ type: 'status', message: 'Saving your plan…' })

        // Insert intake form
        const { data: plan, error: planError } = await supabase
          .from('intake_forms')
          .insert({
            wedding_date:   intake.weddingDate,
            guest_count:    intake.guestCount,
            city:           intake.city,
            venue_type:     intake.venueType,
            budget_bracket: intake.budgetBracket,
            priorities:     intake.priorities,
          })
          .select()
          .single()

        if (planError || !plan) {
          console.error('[/api/recommend] DB insert (plan):', planError)
          send({ type: 'error', message: 'Failed to save plan. Please try again.' })
          return
        }

        // Insert recommendations — roll back plan row if this fails
        const { data: savedRecs, error: recsError } = await supabase
          .from('recommendations')
          .insert(
            recommendations.map((rec, i) => ({
              plan_id:            plan.id,
              category:           rec.category,
              priority_rank:      rec.priorityRank,
              suggested_min:      Math.round(rec.suggestedMin),
              suggested_max:      Math.round(rec.suggestedMax),
              allocation_percent: rec.allocationPercent,
              rationale:          rec.rationale,
              tips:               rec.tips,
              sort_order:         i,
            }))
          )
          .select()

        if (recsError || !savedRecs) {
          console.error('[/api/recommend] DB insert (recommendations):', recsError)
          // Clean up the orphan plan row
          await supabase.from('intake_forms').delete().eq('id', plan.id)
          send({ type: 'error', message: 'Failed to save recommendations. Please try again.' })
          return
        }

        send({
          type: 'done',
          planId: plan.id,
          recommendations: savedRecs.map(r => ({
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
        })
      } finally {
        clearInterval(ticker)
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
