'use client'

import { Text, Badge, Button, UnstyledButton, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronUp, IconBulb, IconPlus, IconAdjustments } from '@tabler/icons-react'
import { BudgetProgressBar }  from '../budget/BudgetProgressBar'
import { LogPaymentModal }    from '../budget/LogPaymentModal'
import { ManageBudgetModal }  from './ManageBudgetModal'
import { formatCompactINR }   from '@/src/lib/currency'
import type { Recommendation, Payment } from '@/src/types'

const CATEGORY_COLORS: Record<string, string> = {
  'Photography & Videography': '#7C3AED',
  'Food & Catering':           '#B45309',
  'Décor & Florals':           '#047857',
  'Music & Entertainment':     '#1D4ED8',
  'Bridal Wear & Jewellery':   '#BE185D',
  'Venue':                     '#B5451B',
  'Mehendi & Beauty':          '#92400E',
  'Invitation & Stationery':   '#374151',
}

interface Props {
  recommendation: Recommendation
  payments:       Payment[]
  planId:         string
}

export function RecommendationCard({ recommendation: rec, payments, planId }: Props) {
  const [paymentOpen,  { open: openPayment,  close: closePayment }] = useDisclosure(false)
  const [manageOpen,   { open: openManage,   close: closeManage  }] = useDisclosure(false)
  const [tipsOpen,     { toggle: toggleTips }]                       = useDisclosure(false)
  const [paymentsOpen, { toggle: togglePayments }]                   = useDisclosure(false)

  const spent       = payments.reduce((s, p) => s + p.amount, 0)
  const isPriority  = rec.priorityRank !== null && rec.priorityRank <= 2
  const accentColor = CATEGORY_COLORS[rec.category] ?? '#B5451B'
  const overBudget  = spent > rec.suggestedMax
  const nearLimit   = spent / rec.suggestedMax >= 0.8 && !overBudget
  const spentColor  = overBudget ? '#B91C1C' : nearLimit ? '#C27A00' : accentColor

  return (
    <>
      <div style={{
        background:    'white',
        borderRadius:  16,
        border:        `1px solid ${isPriority ? '#F8D5C5' : '#F0F0F0'}`,
        boxShadow:     isPriority ? '0 2px 12px rgba(181,69,27,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        overflow:      'hidden',
        transition:    'box-shadow 200ms',
      }}>
        {/* Accent strip */}
        <div style={{ height: 4, background: accentColor }} />

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text fw={700} size="sm" style={{ color: '#1A1A1A' }}>{rec.category}</Text>
                {isPriority && (
                  <Badge size="xs" color="brand" variant="light" style={{ fontSize: 10 }}>
                    ★ Priority {rec.priorityRank}
                  </Badge>
                )}
              </div>
              <Text size="xs" c="dimmed" mt={2}>
                {formatCompactINR(rec.suggestedMin)} – {formatCompactINR(rec.suggestedMax)}
              </Text>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Text fw={700} size="sm" style={{ color: spentColor, fontVariantNumeric: 'tabular-nums' }}>
                {formatCompactINR(spent)}
              </Text>
              <Text size="xs" c="dimmed">spent</Text>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <BudgetProgressBar spent={spent} max={rec.suggestedMax} height={6} />
            {overBudget && (
              <Text size="xs" c="red" mt={3}>
                Over by {formatCompactINR(spent - rec.suggestedMax)}
              </Text>
            )}
          </div>

          {/* Rationale */}
          <Text size="xs" c="dimmed" lineClamp={2} style={{ lineHeight: 1.5 }}>
            {rec.rationale || 'No description.'}
          </Text>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              size="xs"
              variant="light"
              color="brand"
              leftSection={<IconPlus size={13} />}
              onClick={openPayment}
              style={{ flex: 1 }}
            >
              Log Payment
            </Button>

            <UnstyledButton
              onClick={openManage}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: '#B5451B', fontSize: 12, fontWeight: 500,
                padding: '4px 10px', borderRadius: 8,
                border: '1px solid #F8D5C5', background: '#FFF8F5',
                flexShrink: 0,
              }}
            >
              <IconAdjustments size={13} />
              Manage
            </UnstyledButton>

            <UnstyledButton
              onClick={toggleTips}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: '#6B7280', fontSize: 12,
                padding: '4px 10px', borderRadius: 8,
                border: '1px solid #E9ECEF',
                flexShrink: 0,
              }}
            >
              <IconBulb size={13} />
              Tips
              {tipsOpen ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
            </UnstyledButton>
          </div>

          {/* Tips panel */}
          {tipsOpen && rec.tips.length > 0 && (
            <Stack gap={6} style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
              {rec.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#FFF0EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <Text size="xs" style={{ color: '#B5451B', fontWeight: 700, fontSize: 10 }}>{i + 1}</Text>
                  </div>
                  <Text size="xs" style={{ color: '#374151', lineHeight: 1.5 }}>{tip}</Text>
                </div>
              ))}
            </Stack>
          )}

          {/* Payments accordion */}
          {payments.length > 0 && (
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
              <UnstyledButton
                onClick={togglePayments}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '2px 0',
                }}
              >
                <Text size="xs" c="dimmed" fw={500}>
                  Payments ({payments.length})
                </Text>
                {paymentsOpen
                  ? <IconChevronUp size={13} color="#9CA3AF" />
                  : <IconChevronDown size={13} color="#9CA3AF" />}
              </UnstyledButton>

              {paymentsOpen && (
                <Stack gap={4} mt={8}>
                  {payments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <Text size="xs" style={{ color: '#374151' }} truncate>{p.vendorName}</Text>
                        <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                          {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {p.notes && ` · ${p.notes}`}
                        </Text>
                      </div>
                      <Text size="xs" fw={600} style={{ color: '#1A1A1A', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        {formatCompactINR(p.amount)}
                      </Text>
                    </div>
                  ))}
                </Stack>
              )}
            </div>
          )}
        </div>
      </div>

      <LogPaymentModal
        opened={paymentOpen}
        onClose={closePayment}
        recommendation={rec}
        planId={planId}
      />
      <ManageBudgetModal
        opened={manageOpen}
        onClose={closeManage}
        recommendation={rec}
        planId={planId}
      />
    </>
  )
}
