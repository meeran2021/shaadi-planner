'use client'
import { useState } from 'react'
import { Modal, Stack, TextInput, NumberInput, Textarea, Button, Group, Text } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconCurrencyRupee } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import { useLogPayment } from '@/src/hooks/useLogPayment'
import type { Recommendation } from '@/src/types'

interface Props {
  opened:         boolean
  onClose:        () => void
  recommendation: Recommendation
  planId:         string
}

interface FormState {
  vendorName:  string
  amount:      number | ''
  paymentDate: Date | null
  notes:       string
}

interface FormErrors {
  vendorName?:  string
  amount?:      string
  paymentDate?: string
}

export function LogPaymentModal({ opened, onClose, recommendation, planId }: Props) {
  const logPayment = useLogPayment(planId)

  const [form, setForm] = useState<FormState>({
    vendorName:  '',
    amount:      '',
    paymentDate: new Date(),
    notes:       '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.vendorName.trim()) e.vendorName  = 'Vendor name is required'
    if (!form.amount || form.amount <= 0) e.amount = 'Enter a valid amount'
    if (!form.paymentDate) e.paymentDate = 'Select a payment date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    logPayment.mutate(
      {
        planId,
        recommendationId: recommendation.id,
        vendorName:       form.vendorName.trim(),
        amount:           form.amount as number,
        paymentDate:      form.paymentDate
                            ? dayjs(form.paymentDate).format('YYYY-MM-DD')
                            : dayjs().format('YYYY-MM-DD'),
        notes:            form.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title:   'Payment logged',
            message: `₹${(form.amount as number).toLocaleString('en-IN')} paid to ${form.vendorName}`,
            color:   'green',
          })
          setForm({ vendorName: '', amount: '', paymentDate: new Date(), notes: '' })
          setErrors({})
          onClose()
        },
        onError: err => {
          notifications.show({
            title:   'Could not log payment',
            message: err.message,
            color:   'red',
          })
        },
      }
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={700} size="md">Log a Payment</Text>
          <Text size="xs" c="dimmed">{recommendation.category}</Text>
        </div>
      }
      centered
      size="sm"
    >
      <Stack gap="md" pt={4}>
        <TextInput
          label="Vendor name"
          placeholder="e.g. Studio Moments Photography"
          value={form.vendorName}
          onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, vendorName: v })) }}
          error={errors.vendorName}
          required
        />

        <NumberInput
          label="Amount paid (₹)"
          placeholder="e.g. 150000"
          value={form.amount}
          onChange={v => setForm(f => ({ ...f, amount: v as number | '' }))}
          error={errors.amount}
          min={1}
          leftSection={<IconCurrencyRupee size={16} />}
          thousandSeparator=","
          required
        />

        <DateInput
          label="Payment date"
          value={form.paymentDate}
          onChange={(d: Date | null) => setForm(f => ({ ...f, paymentDate: d }))}
          error={errors.paymentDate}
          maxDate={new Date()}
          required
        />

        <Textarea
          label="Notes (optional)"
          placeholder="Advance payment, final payment, token amount…"
          value={form.notes}
          onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, notes: v })) }}
          rows={2}
          autosize
          minRows={2}
          maxRows={4}
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={logPayment.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={logPayment.isPending}
            style={{ background: '#B5451B' }}
          >
            Log Payment
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
