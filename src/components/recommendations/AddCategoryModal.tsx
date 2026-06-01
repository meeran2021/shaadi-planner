'use client'
import { useState } from 'react'
import { Modal, Stack, TextInput, NumberInput, Textarea, Button, Group, Text } from '@mantine/core'
import { IconCurrencyRupee } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useAddCategory } from '@/src/hooks/useAddCategory'

interface Props {
  opened:  boolean
  onClose: () => void
  planId:  string
}

interface FormState {
  category:     string
  suggestedMin: number | ''
  suggestedMax: number | ''
  rationale:    string
}

interface FormErrors {
  category?:     string
  suggestedMin?: string
  suggestedMax?: string
}

export function AddCategoryModal({ opened, onClose, planId }: Props) {
  const addCategory = useAddCategory(planId)

  const [form, setForm] = useState<FormState>({
    category:     '',
    suggestedMin: '',
    suggestedMax: '',
    rationale:    '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.category.trim()) e.category = 'Category name is required'
    if (!form.suggestedMin || form.suggestedMin <= 0) e.suggestedMin = 'Enter a valid amount'
    if (!form.suggestedMax || form.suggestedMax <= 0) e.suggestedMax = 'Enter a valid amount'
    if (form.suggestedMin && form.suggestedMax && (form.suggestedMax as number) < (form.suggestedMin as number)) {
      e.suggestedMax = 'Max must be ≥ min'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    addCategory.mutate(
      {
        planId,
        category:     form.category.trim(),
        suggestedMin: form.suggestedMin as number,
        suggestedMax: form.suggestedMax as number,
        rationale:    form.rationale.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({ title: 'Category added', message: `${form.category} added to your plan`, color: 'green' })
          setForm({ category: '', suggestedMin: '', suggestedMax: '', rationale: '' })
          setErrors({})
          onClose()
        },
        onError: err => notifications.show({ title: 'Failed to add', message: err.message, color: 'red' }),
      }
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md">Add a Category</Text>}
      centered
      size="sm"
    >
      <Stack gap="md" pt={4}>
        <TextInput
          label="Category name"
          placeholder="e.g. Transportation, Gift Registry, Pre-wedding Shoot"
          value={form.category}
          onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, category: v })) }}
          error={errors.category}
          required
        />
        <Group grow>
          <NumberInput
            label="Min budget (₹)"
            placeholder="e.g. 50000"
            value={form.suggestedMin}
            onChange={v => setForm(f => ({ ...f, suggestedMin: v as number | '' }))}
            error={errors.suggestedMin}
            min={1}
            allowNegative={false}
            clampBehavior="strict"
            leftSection={<IconCurrencyRupee size={16} />}
            thousandSeparator=","
            required
          />
          <NumberInput
            label="Max budget (₹)"
            placeholder="e.g. 100000"
            value={form.suggestedMax}
            onChange={v => setForm(f => ({ ...f, suggestedMax: v as number | '' }))}
            error={errors.suggestedMax}
            min={1}
            allowNegative={false}
            clampBehavior="strict"
            leftSection={<IconCurrencyRupee size={16} />}
            thousandSeparator=","
            required
          />
        </Group>
        <Textarea
          label="Notes (optional)"
          placeholder="What this budget covers…"
          value={form.rationale}
          onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, rationale: v })) }}
          autosize
          minRows={2}
          maxRows={4}
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={addCategory.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={addCategory.isPending} style={{ background: '#B5451B' }}>
            Add Category
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
