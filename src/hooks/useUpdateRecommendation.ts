import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Recommendation, PlanResponse } from '@/src/types'

interface UpdateInput {
  recommendationId: string
  planId:           string
  suggestedMin:     number
  suggestedMax:     number
}

async function updateRecommendation({ recommendationId, suggestedMin, suggestedMax }: UpdateInput): Promise<Recommendation> {
  const res = await fetch(`/api/category/${recommendationId}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ suggestedMin, suggestedMax }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errors = (body as { errors?: { message: string }[] }).errors
    const error  = (body as { error?: string }).error
    throw new Error(errors?.[0]?.message ?? error ?? 'Failed to update budget')
  }
  return body as Recommendation
}

export function useUpdateRecommendation(planId: string) {
  const queryClient = useQueryClient()

  return useMutation<Recommendation, Error, UpdateInput>({
    mutationFn: updateRecommendation,
    onSuccess: (updated) => {
      queryClient.setQueryData<PlanResponse>(['plan', planId], (old) => {
        if (!old) return old
        const recs = old.recommendations.map(r =>
          r.id === updated.id ? { ...r, suggestedMin: updated.suggestedMin, suggestedMax: updated.suggestedMax } : r
        )
        return {
          ...old,
          recommendations: recs,
          summary: {
            ...old.summary,
            totalAllocated: recs.reduce((s, r) => s + r.suggestedMax, 0),
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
    },
  })
}
