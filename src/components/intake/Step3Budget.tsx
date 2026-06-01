'use client'
import { Title, Text, Stack, SimpleGrid } from '@mantine/core'
import { SelectionCard } from '../ui/SelectionCard'
import type { BudgetBracket } from '@/src/types'

const BUDGET_OPTIONS: { value: BudgetBracket; tier: string; range: string; desc: string; color: string }[] = [
  { value: '10-25L',  tier: 'Essentials',   range: '₹10L – ₹25L',   desc: 'Simple & meaningful',  color: '#6B7280' },
  { value: '25-50L',  tier: 'Classic',      range: '₹25L – ₹50L',   desc: 'The sweet spot',       color: '#2D7A46' },
  { value: '50L-1Cr', tier: 'Premium',      range: '₹50L – ₹1Cr',   desc: 'All the touches',      color: '#1D4ED8' },
  { value: '1-2Cr',   tier: 'Luxury',       range: '₹1Cr – ₹2Cr',   desc: 'No compromises',       color: '#7C3AED' },
  { value: '2Cr+',    tier: 'Ultra Luxury', range: '₹2Cr+',          desc: 'The grandest affair',  color: '#B5451B' },
]

interface Props {
  budgetBracket: BudgetBracket | ''
  errors:        Record<string, string>
  onChange:      (field: 'budgetBracket', value: BudgetBracket) => void
}

export function Step3Budget({ budgetBracket, errors, onChange }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ color: '#1A1A1A', fontWeight: 700 }}>
          What&apos;s your total budget?
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          This helps us allocate across all vendor categories realistically.
        </Text>
      </div>

      <div>
        <SimpleGrid cols={1} spacing="sm">
          {BUDGET_OPTIONS.map(opt => (
            <SelectionCard
              key={opt.value}
              selected={budgetBracket === opt.value}
              onClick={() => onChange('budgetBracket', opt.value)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: budgetBracket === opt.value ? '#B5451B' : opt.color,
                    flexShrink: 0,
                  }} />
                  <div style={{ textAlign: 'left' }}>
                    <Text fw={700} size="md" style={{ color: budgetBracket === opt.value ? '#B5451B' : '#1A1A1A' }}>
                      {opt.range}
                    </Text>
                    <Text size="xs" c="dimmed">{opt.desc}</Text>
                  </div>
                </div>
                <Text fw={600} size="sm" style={{ color: budgetBracket === opt.value ? '#B5451B' : '#6B7280' }}>
                  {opt.tier}
                </Text>
              </div>
            </SelectionCard>
          ))}
        </SimpleGrid>
        {errors.budgetBracket && (
          <Text c="red" size="xs" mt={6}>{errors.budgetBracket}</Text>
        )}
      </div>
    </Stack>
  )
}
