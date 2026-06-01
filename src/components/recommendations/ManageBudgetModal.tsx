'use client'
import { useState } from 'react'
import { Modal, Stack, NumberInput, Button, Group, Text, Divider } from '@mantine/core'
import { IconCurrencyRupee, IconTrash } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUpdateRecommendation } from '@/src/hooks/useUpdateRecommendation'
import { useDeleteRecommendation } from '@/src/hooks/useDeleteRecommendation'
import type { Recommendation } from '@/src/types'

interface Props {
  opened:         boolean
  onClose:        () => void
  recommendation: Recommendation
  planId:         string
}

export function ManageBudgetModal({ opened, onClose, recommendation: rec, planId }: Props) {
  const update = useUpdateRecommendation(planId)
  const remove = useDeleteRecommendation(planId)

  const [min, setMin] = useState<number | ''>(rec.suggestedMin)
  const [max, setMax] = useState<number | ''>(rec.suggestedMax)
  const [errors, setErrors] = useState<{ min?: string; max?: string }>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleClose() {
    setMin(rec.suggestedMin)
    setMax(rec.suggestedMax)
    setErrors({})
    setConfirmDelete(false)
    onClose()
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!min || min <= 0) e.min = 'Enter a valid amount'
    if (!max || max <= 0) e.max = 'Enter a valid amount'
    if (min && max && (max as number) < (min as number)) e.max = 'Max must be ≥ min'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleUpdate() {
    if (!validate()) return
    update.mutate(
      { recommendationId: rec.id, planId, suggestedMin: min as number, suggestedMax: max as number },
      {
        onSuccess: () => {
          notifications.show({ title: 'Budget updated', message: `${rec.category} range saved`, color: 'green' })
          handleClose()
        },
        onError: err => notifications.show({ title: 'Update failed', message: err.message, color: 'red' }),
      }
    )
  }

  function handleDelete() {
    remove.mutate(
      { recommendationId: rec.id, planId },
      {
        onSuccess: () => {
          notifications.show({ title: 'Category removed', message: `${rec.category} deleted`, color: 'orange' })
          handleClose()
        },
        onError: err => notifications.show({ title: 'Delete failed', message: err.message, color: 'red' }),
      }
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="md">Manage Budget</Text>
          <Text size="xs" c="dimmed">{rec.category}</Text>
        </div>
      }
      centered
      size="sm"
    >
      <Stack gap="md" pt={4}>
        <NumberInput
          label="Minimum budget (₹)"
          value={min}
          onChange={v => setMin(v as number | '')}
          error={errors.min}
          min={1}
          leftSection={<IconCurrencyRupee size={16} />}
          thousandSeparator=","
          required
        />
        <NumberInput
          label="Maximum budget (₹)"
          value={max}
          onChange={v => setMax(v as number | '')}
          error={errors.max}
          min={1}
          leftSection={<IconCurrencyRupee size={16} />}
          thousandSeparator=","
          required
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={handleClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} loading={update.isPending} style={{ background: '#B5451B' }}>
            Save Budget
          </Button>
        </Group>

        <Divider label="Danger zone" labelPosition="center" />

        {confirmDelete ? (
          <Stack gap="xs">
            <Text size="xs" c="red" ta="center">
              This permanently deletes <strong>{rec.category}</strong> and all its logged payments.
            </Text>
            <Group grow>
              <Button variant="subtle" color="gray" size="xs" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button color="red" size="xs" loading={remove.isPending} onClick={handleDelete}>
                Yes, delete
              </Button>
            </Group>
          </Stack>
        ) : (
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={14} />}
            size="xs"
            onClick={() => setConfirmDelete(true)}
          >
            Delete this category
          </Button>
        )}
      </Stack>
    </Modal>
  )
}
