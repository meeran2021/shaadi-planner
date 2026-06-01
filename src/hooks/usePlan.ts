import { useQuery } from '@tanstack/react-query'
import type { PlanResponse } from '@/src/types'

async function fetchPlan(planId: string): Promise<PlanResponse> {
  const res = await fetch(`/api/recommendations/${planId}`)
  if (res.status === 404) throw new Error('Plan not found')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to load plan')
  }
  return res.json()
}

export function usePlan(planId: string) {
  return useQuery<PlanResponse, Error>({
    queryKey: ['plan', planId],
    queryFn:  () => fetchPlan(planId),
    enabled:  !!planId,
    retry: (failureCount, error) => error.message !== 'Plan not found' && failureCount < 2,
  })
}
