import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Payment, PaymentInput, PlanResponse } from '@/src/types'

async function logPayment(payment: PaymentInput): Promise<Payment> {
  const res = await fetch('/api/payments', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payment),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errors = (body as { errors?: { message: string }[] }).errors
    const error  = (body as { error?: string }).error
    throw new Error(errors?.[0]?.message ?? error ?? 'Failed to log payment')
  }

  return body as Payment
}

export function useLogPayment(planId: string) {
  const queryClient = useQueryClient()

  return useMutation<Payment, Error, PaymentInput>({
    mutationFn: logPayment,
    onSuccess: (newPayment) => {
      // Immediately update the cache so the UI reflects the payment without
      // waiting for a background refetch to complete.
      queryClient.setQueryData<PlanResponse>(['plan', planId], (old) => {
        if (!old) return old
        const updatedPayments = [...old.payments, newPayment]
        const totalSpent = updatedPayments.reduce((s, p) => s + p.amount, 0)
        return {
          ...old,
          payments: updatedPayments,
          summary: {
            ...old.summary,
            totalSpent,
            balance: old.summary.totalBudget - totalSpent,
          },
        }
      })
      // Then sync with the server in the background.
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
    },
  })
}
