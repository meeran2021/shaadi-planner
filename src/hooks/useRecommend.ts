import { useState, useCallback } from 'react'
import type { IntakeFormInput, RecommendResponse } from '@/src/types'

type SSEEvent =
  | { type: 'status'; message: string }
  | { type: 'done'; planId: string; recommendations: RecommendResponse['recommendations'] }
  | { type: 'error'; message: string }

const STORAGE_KEY = 'shaadi_plan_ids'

export function savePlanId(planId: string) {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!existing.includes(planId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([planId, ...existing]))
    }
  } catch { /* localStorage unavailable */ }
}

export function getSavedPlanIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecommend() {
  const [isPending,     setIsPending]     = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const generate = useCallback(async (
    intake: IntakeFormInput,
    callbacks: {
      onSuccess: (planId: string) => void
      onError:   (err: Error) => void
    }
  ) => {
    setIsPending(true)
    setStatusMessage('Starting…')

    try {
      const res = await fetch('/api/recommend', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(intake),
      })

      // Non-streaming error (validation failures come back as JSON, not SSE)
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}))
        const errors = (body as { errors?: { message: string }[] }).errors
        const error  = (body as { error?: string }).error
        throw new Error(errors?.[0]?.message ?? error ?? 'Failed to generate plan')
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue
          let event: SSEEvent
          try {
            event = JSON.parse(line.slice(6)) as SSEEvent
          } catch { continue }

          if (event.type === 'status') {
            setStatusMessage(event.message)
          } else if (event.type === 'done') {
            savePlanId(event.planId)
            callbacks.onSuccess(event.planId)
            break outer
          } else if (event.type === 'error') {
            throw new Error(event.message)
          }
        }
      }
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsPending(false)
      setStatusMessage('')
    }
  }, [])

  return { generate, isPending, statusMessage }
}
