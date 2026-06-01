'use client'
import { SimpleGrid, Text } from '@mantine/core'
import { formatCompactINR } from '@/src/lib/currency'
import type { BudgetSummaryData } from '@/src/types'

interface StatCardProps {
  label:   string
  value:   string
  sub?:    string
  accent?: string
  bg?:     string
}

function StatCard({ label, value, sub, accent = '#1A1A1A', bg = '#FAFAFA' }: StatCardProps) {
  return (
    <div style={{
      padding:      '16px 20px',
      borderRadius: 14,
      background:   bg,
      border:       '1px solid #F0F0F0',
    }}>
      <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <Text fw={700} size="xl" mt={4} style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </div>
  )
}

interface Props {
  summary: BudgetSummaryData
}

export function BudgetSummary({ summary }: Props) {
  const { totalBudget, totalSpent, balance } = summary
  const spentPct  = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const overSpent = balance < 0

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
      <StatCard
        label="Total Budget"
        value={formatCompactINR(totalBudget)}
        sub="Your planning budget"
        bg="#FFF0EB"
        accent="#B5451B"
      />
      <StatCard
        label="Spent"
        value={formatCompactINR(totalSpent)}
        sub={`${spentPct}% of budget`}
        accent={spentPct >= 80 ? '#B91C1C' : '#1A1A1A'}
      />
      <StatCard
        label="Balance"
        value={formatCompactINR(Math.abs(balance))}
        sub={overSpent ? 'Over budget' : 'Remaining'}
        accent={overSpent ? '#B91C1C' : '#2D7A46'}
        bg={overSpent ? '#FEF2F2' : '#F0FDF4'}
      />
    </SimpleGrid>
  )
}
