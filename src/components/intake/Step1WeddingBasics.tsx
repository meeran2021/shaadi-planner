'use client'
import { Title, Text, Stack, SimpleGrid } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconCalendar, IconUsers } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { SelectionCard } from '../ui/SelectionCard'
import type { GuestCountBracket } from '@/src/types'

const GUEST_OPTIONS: { value: GuestCountBracket; label: string; sub: string; emoji: string }[] = [
  { value: '<100',     label: 'Intimate',  sub: 'Under 100',     emoji: '🌸' },
  { value: '100-300',  label: 'Classic',   sub: '100 – 300',     emoji: '✨' },
  { value: '300-500',  label: 'Grand',     sub: '300 – 500',     emoji: '🎊' },
  { value: '500+',     label: 'Royal',     sub: '500+ guests',   emoji: '👑' },
]

interface Props {
  weddingDate: string
  guestCount:  GuestCountBracket | ''
  errors:      Record<string, string>
  onChange:    (field: 'weddingDate' | 'guestCount', value: string) => void
}

export function Step1WeddingBasics({ weddingDate, guestCount, errors, onChange }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ color: '#1A1A1A', fontWeight: 700 }}>
          When&apos;s the big day?
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          Every great plan starts with a date.
        </Text>
      </div>

      <DateInput
        label="Wedding date"
        placeholder="Select your wedding date"
        value={weddingDate ? new Date(weddingDate) : null}
        onChange={d => onChange('weddingDate', d ? dayjs(d).format('YYYY-MM-DD') : '')}
        minDate={new Date()}
        error={errors.weddingDate}
        leftSection={<IconCalendar size={16} />}
        size="md"
        required
      />

      <div>
        <Text fw={500} mb="xs" size="sm">
          <IconUsers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Approximate guest count
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {GUEST_OPTIONS.map(opt => (
            <SelectionCard
              key={opt.value}
              selected={guestCount === opt.value}
              onClick={() => onChange('guestCount', opt.value)}
            >
              <Text size="xl" lh={1}>{opt.emoji}</Text>
              <Text fw={600} size="sm">{opt.label}</Text>
              <Text size="xs" c="dimmed">{opt.sub}</Text>
            </SelectionCard>
          ))}
        </SimpleGrid>
        {errors.guestCount && (
          <Text c="red" size="xs" mt={6}>{errors.guestCount}</Text>
        )}
      </div>
    </Stack>
  )
}
