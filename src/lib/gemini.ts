import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { z } from 'zod'
import { bracketToMidpoint } from './currency'
import type { IntakeFormInput } from '@/src/types'

// Factory functions — models are created at request time, not at build time.
function getRecommendationModel() {
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!).getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            category:          { type: SchemaType.STRING },
            priorityRank:      { type: SchemaType.NUMBER },
            suggestedMin:      { type: SchemaType.NUMBER },
            suggestedMax:      { type: SchemaType.NUMBER },
            allocationPercent: { type: SchemaType.NUMBER },
            rationale:         { type: SchemaType.STRING },
            tips: {
              type:  SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: [
            'category', 'priorityRank', 'suggestedMin',
            'suggestedMax', 'allocationPercent', 'rationale', 'tips',
          ],
        },
      },
    },
  })
}

export function getChatModel(systemInstruction: string) {
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!).getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  })
}

// Structural validity guaranteed by responseSchema; Zod handles semantics only.
const RecommendationSemanticSchema = z.array(z.object({
  category:          z.string().min(1),
  priorityRank:      z.number().int().min(1),
  suggestedMin:      z.number().positive(),
  suggestedMax:      z.number().positive(),
  allocationPercent: z.number().positive().max(100),
  rationale:         z.string().min(10),
  tips:              z.array(z.string()).min(1),
})).min(6).refine(
  items => Math.abs(items.reduce((s, i) => s + i.allocationPercent, 0) - 100) < 2,
  { message: 'Allocations must sum to ~100%' }
)

export function buildRecommendationPrompt(intake: IntakeFormInput): string {
  const budget       = bracketToMidpoint(intake.budgetBracket)
  const priorityList = intake.priorities.join(' and ')

  return `You are an expert Indian wedding planner with deep knowledge of vendor costs across Indian cities.

Generate budget allocation recommendations for a couple's wedding with these details:
- Wedding date: ${intake.weddingDate}
- Guest count: ${intake.guestCount}
- City: ${intake.city}
- Venue type: ${intake.venueType.replace(/_/g, ' ')}
- Total budget: ₹${budget.toLocaleString('en-IN')} (${intake.budgetBracket} bracket)
- Top 2 priorities: ${priorityList}

Return a JSON array with EXACTLY 8 objects, one for each of these categories:
1. Photography & Videography
2. Food & Catering
3. Décor & Florals
4. Music & Entertainment
5. Bridal Wear & Jewellery
6. Venue
7. Mehendi & Beauty
8. Invitation & Stationery

Rules:
- The 2 priority categories must have priorityRank 1 and 2 respectively
- Priority categories must receive at least 15% more allocation than comparable non-priority categories
- suggestedMin and suggestedMax must be realistic for ${intake.city} weddings with ${intake.guestCount} guests
- allocationPercent values must sum to exactly 100
- Each tip must be specific to ${intake.city} and the ${intake.venueType.replace(/_/g, ' ')} venue type — not generic advice
- Provide exactly 3 tips per category`
}

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number })?.status
  return status === 503 || status === 429
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const last = attempt === maxAttempts
      if (!isRetryable(err) || last) throw err
      const delay = 1500 * Math.pow(2, attempt - 1) // 1.5s, 3s, 6s
      console.log(`[gemini] attempt ${attempt} failed (${(err as {status?:number}).status}), retrying in ${delay}ms…`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

function enforcePriorityRanks(
  recs: z.infer<typeof RecommendationSemanticSchema>,
  priorities: readonly string[]
): z.infer<typeof RecommendationSemanticSchema> {
  const result = recs.map(r => ({ ...r }))
  priorities.forEach((priority, idx) => {
    const match = result.find(r => r.category === priority)
    if (match) match.priorityRank = idx + 1
  })
  return result
}

export async function getRecommendations(intake: IntakeFormInput) {
  return withRetry(async () => {
    const model  = getRecommendationModel()
    const result = await model.generateContent(buildRecommendationPrompt(intake))
    const raw    = result.response.text()
    const parsed = JSON.parse(raw)
    const recs   = RecommendationSemanticSchema.parse(parsed)
    return enforcePriorityRanks(recs, intake.priorities)
  })
}
