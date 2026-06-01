'use client'
import { Title, Text, Stack, Group, UnstyledButton } from '@mantine/core'
import { IconEdit, IconCalendar, IconMapPin, IconCurrencyRupee, IconStar } from '@tabler/icons-react'

const VENUE_LABELS: Record<string, string> = {
  banquet_hall:      'Banquet Hall',
  farmhouse:         'Farmhouse',
  heritage_property: 'Heritage Property',
  destination:       'Destination',
  home:              'At Home',
}

const GUEST_LABELS: Record<string, string> = {
  '<100':    'Under 100 guests (Intimate)',
  '100-300': '100–300 guests (Classic)',
  '300-500': '300–500 guests (Grand)',
  '500+':    '500+ guests (Royal)',
}

const BUDGET_LABELS: Record<string, string> = {
  '10-25L':  '₹10L – ₹25L (Essentials)',
  '25-50L':  '₹25L – ₹50L (Classic)',
  '50L-1Cr': '₹50L – ₹1Cr (Premium)',
  '1-2Cr':   '₹1Cr – ₹2Cr (Luxury)',
  '2Cr+':    '₹2Cr+ (Ultra Luxury)',
}

interface FormData {
  weddingDate:   string
  guestCount:    string
  city:          string
  venueType:     string
  budgetBracket: string
  priorities:    string[]
}

interface Props {
  formData:      FormData
  onEdit:        (step: number) => void
  disabled?:     boolean
  statusMessage?: string
}

function SummaryRow({
  icon, label, value, step, onEdit, disabled,
}: {
  icon:     React.ReactNode
  label:    string
  value:    string
  step:     number
  onEdit:   (step: number) => void
  disabled?: boolean
}) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'flex-start',
      justifyContent: 'space-between',
      padding:        '14px 16px',
      borderRadius:   12,
      background:     '#FAFAFA',
      border:         '1px solid #F0F0F0',
      gap:            12,
    }}>
      <Group gap={10} style={{ flex: 1 }}>
        <div style={{ color: '#B5451B', flexShrink: 0 }}>{icon}</div>
        <div>
          <Text size="xs" c="dimmed" fw={500}>{label}</Text>
          <Text size="sm" fw={600} style={{ color: '#1A1A1A' }}>{value}</Text>
        </div>
      </Group>
      {!disabled && (
        <UnstyledButton
          onClick={() => onEdit(step)}
          style={{ color: '#B5451B', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        >
          <IconEdit size={13} />
          Edit
        </UnstyledButton>
      )}
    </div>
  )
}

export function StepReview({ formData, onEdit, disabled, statusMessage }: Props) {
  const weddingDate = formData.weddingDate
    ? new Date(formData.weddingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ color: '#1A1A1A', fontWeight: 700 }}>
          Your wedding summary ✨
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          {disabled
            ? (statusMessage || 'Generating your personalised budget plan…')
            : 'Everything looks good? We\'ll generate your personalised budget plan.'}
        </Text>
      </div>

      <Stack gap="sm">
        <SummaryRow
          icon={<IconCalendar size={18} />}
          label="Wedding Date & Guests"
          value={`${weddingDate} · ${GUEST_LABELS[formData.guestCount] ?? formData.guestCount}`}
          step={1} onEdit={onEdit} disabled={disabled}
        />
        <SummaryRow
          icon={<IconMapPin size={18} />}
          label="City & Venue"
          value={`${formData.city} · ${VENUE_LABELS[formData.venueType] ?? formData.venueType}`}
          step={2} onEdit={onEdit} disabled={disabled}
        />
        <SummaryRow
          icon={<IconCurrencyRupee size={18} />}
          label="Total Budget"
          value={BUDGET_LABELS[formData.budgetBracket] ?? formData.budgetBracket}
          step={3} onEdit={onEdit} disabled={disabled}
        />
        <SummaryRow
          icon={<IconStar size={18} />}
          label="Top 2 Priorities"
          value={formData.priorities.join(' & ')}
          step={4} onEdit={onEdit} disabled={disabled}
        />
      </Stack>

      <div style={{
        padding:      '14px 16px',
        borderRadius: 12,
        background:   'linear-gradient(135deg, #FFF0EB 0%, #FDF6EE 100%)',
        border:       '1px solid #F8D5C5',
      }}>
        <Text size="sm" style={{ color: '#7D2C12' }}>
          🪄 AI will generate city-specific budget allocations for all 8 vendor categories,
          prioritising <strong>{formData.priorities.join(' and ')}</strong>.
        </Text>
      </div>
    </Stack>
  )
}
