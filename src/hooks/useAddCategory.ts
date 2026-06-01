import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Recommendation, PlanResponse } from '@/src/types'

export interface AddCategoryInput {
  planId:       string
  category:     string
  suggestedMin: number
  suggestedMax: number
  rationale?:   string
}

async function addCategory(input: AddCategoryInput): Promise<Recommendation> {
  const res = await fetch('/api/category', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errors = (body as { errors?: { message: string }[] }).errors
    const error  = (body as { error?: string }).error
    throw new Error(errors?.[0]?.message ?? error ?? 'Failed to add category')
  }
  return body as Recommendation
}

export function useAddCategory(planId: string) {
  const queryClient = useQueryClient()

  return useMutation<Recommendation, Error, AddCategoryInput>({
    mutationFn: addCategory,
    onSuccess: (newRec) => {
      queryClient.setQueryData<PlanResponse>(['plan', planId], (old) => {
        if (!old) return old
        return {
          ...old,
          recommendations: [...old.recommendations, newRec],
          summary: {
            ...old.summary,
            totalAllocated: old.summary.totalAllocated + newRec.suggestedMax,
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
    },
  })
}
