import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlanResponse } from '@/src/types'

interface DeleteInput {
  recommendationId: string
  planId:           string
}

async function deleteRecommendation({ recommendationId }: DeleteInput): Promise<void> {
  const res = await fetch(`/api/category/${recommendationId}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to delete category')
  }
}

export function useDeleteRecommendation(planId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteInput>({
    mutationFn: deleteRecommendation,
    onSuccess: (_, { recommendationId }) => {
      queryClient.setQueryData<PlanResponse>(['plan', planId], (old) => {
        if (!old) return old
        const recs     = old.recommendations.filter(r => r.id !== recommendationId)
        const payments = old.payments.filter(p => p.recommendationId !== recommendationId)
        const totalSpent = payments.reduce((s, p) => s + p.amount, 0)
        return {
          ...old,
          recommendations: recs,
          payments,
          summary: {
            ...old.summary,
            totalAllocated: recs.reduce((s, r) => s + r.suggestedMax, 0),
            totalSpent,
            balance: old.summary.totalBudget - totalSpent,
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
    },
  })
}
