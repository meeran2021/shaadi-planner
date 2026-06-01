import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/src/lib/supabase'
import { getChatModel } from '@/src/lib/gemini'

const ChatSchema = z.object({
  planId: z.string().uuid(),
  messages: z
    .array(z.object({
      role:    z.enum(['user', 'assistant']),
      content: z.string().min(1),
    }))
    .min(1),
})

type DbRecommendation = {
  id: string
  category: string
  priority_rank: number | null
  suggested_min: number
  suggested_max: number
  allocation_percent: number
}

type DbPayment = {
  recommendation_id: string
  amount: number
}

function buildSystemPrompt(
  plan: Record<string, unknown>,
  recommendations: DbRecommendation[],
  payments: DbPayment[],
): string {
  const spentByRec: Record<string, number> = {}
  for (const p of payments) {
    spentByRec[p.recommendation_id] = (spentByRec[p.recommendation_id] ?? 0) + p.amount
  }

  const categoryLines = recommendations.map(r => {
    const spent   = spentByRec[r.id] ?? 0
    const balance = r.suggested_max - spent
    const pct     = r.allocation_percent.toFixed(1)
    const priority = r.priority_rank !== null && r.priority_rank <= 2 ? ` [Priority ${r.priority_rank}]` : ''
    return `  • ${r.category}${priority}: ₹${r.suggested_min.toLocaleString('en-IN')}–₹${r.suggested_max.toLocaleString('en-IN')} (${pct}%) | Spent ₹${spent.toLocaleString('en-IN')} | Balance ₹${balance.toLocaleString('en-IN')}`
  }).join('\n')

  return `You are a friendly and knowledgeable Indian wedding planning advisor.

The couple you are advising has the following wedding plan:
- Wedding date: ${plan.wedding_date}
- City: ${plan.city}
- Venue type: ${String(plan.venue_type).replace(/_/g, ' ')}
- Guest count: ${plan.guest_count}
- Budget range: ${plan.budget_bracket}
- Top priorities: ${(plan.priorities as string[])?.join(' and ')}

Current budget breakdown (suggested range | amount spent so far | remaining balance):
${categoryLines}

When answering questions about budgets, spending, or specific categories, reference the exact figures above. Give specific, practical advice relevant to their city, budget, and priorities. Keep responses concise (2–4 sentences unless detail is explicitly asked for). Recommend local vendors or areas when relevant.`
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { planId, messages } = parsed.data

  const [planResult, recsResult, paymentsResult] = await Promise.all([
    supabase.from('intake_forms').select('*').eq('id', planId).single(),
    supabase.from('recommendations').select('id, category, priority_rank, suggested_min, suggested_max, allocation_percent').eq('plan_id', planId).order('sort_order'),
    supabase.from('payments').select('recommendation_id, amount').eq('plan_id', planId),
  ])

  if (!planResult.data) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const systemPrompt = buildSystemPrompt(
    planResult.data,
    recsResult.data ?? [],
    paymentsResult.data ?? [],
  )

  const history = messages.slice(0, -1).map(m => ({
    role:  m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }))

  const chat = getChatModel(systemPrompt).startChat({ history })

  const lastMessage = messages[messages.length - 1]

  let streamResult: Awaited<ReturnType<typeof chat.sendMessageStream>>
  try {
    streamResult = await chat.sendMessageStream(lastMessage.content)
  } catch (err) {
    console.error('[/api/chat] Gemini stream error:', err)
    return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500 })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(text)}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        console.error('[/api/chat] stream error:', err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
