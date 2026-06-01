'use client'
import { useEffect, useState } from 'react'
import { Stack, SimpleGrid, Text, Button, Skeleton, Badge } from '@mantine/core'
import { IconPlus, IconCalendar, IconMapPin, IconUsers, IconArrowRight, IconClipboardList } from '@tabler/icons-react'
import Link from 'next/link'
import { getSavedPlanIds } from '@/src/hooks/useRecommend'
import { formatCompactINR } from '@/src/lib/currency'
import type { PlanResponse } from '@/src/types'

const VENUE_LABELS: Record<string, string> = {
  banquet_hall:      'Banquet Hall',
  farmhouse:         'Farmhouse',
  heritage_property: 'Heritage Property',
  destination:       'Destination',
  home:              'Home',
}

function PlanCard({ plan, summary }: { plan: PlanResponse['plan']; summary: PlanResponse['summary'] }) {
  const date        = new Date(plan.weddingDate)
  const daysLeft    = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const spentPct    = summary.totalBudget > 0
    ? Math.round((summary.totalSpent / summary.totalBudget) * 100)
    : 0

  return (
    <Link href={`/plan/${plan.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background:   'white',
        borderRadius: 16,
        border:       '1px solid #F0F0F0',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.05)',
        padding:      '20px 22px',
        cursor:       'pointer',
        transition:   'box-shadow 200ms, border-color 200ms',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(181,69,27,0.12)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#F8D5C5'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#F0F0F0'
        }}
      >
        {/* Top: city + arrow */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <Text fw={700} size="lg" style={{ color: '#1A1A1A' }}>{plan.city}</Text>
            <Text size="xs" c="dimmed">{VENUE_LABELS[plan.venueType] ?? plan.venueType}</Text>
          </div>
          <IconArrowRight size={18} color="#B5451B" />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconCalendar size={13} color="#6B7280" />
            <Text size="xs" c="dimmed">
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {daysLeft > 0 && ` · ${daysLeft}d away`}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconUsers size={13} color="#6B7280" />
            <Text size="xs" c="dimmed">{plan.guestCount} guests</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconMapPin size={13} color="#6B7280" />
            <Text size="xs" c="dimmed">₹{plan.budgetBracket}</Text>
          </div>
        </div>

        {/* Budget bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text size="xs" c="dimmed">Spent</Text>
            <Text size="xs" fw={600} style={{ color: spentPct >= 100 ? '#B91C1C' : spentPct >= 80 ? '#C27A00' : '#2D7A46' }}>
              {formatCompactINR(summary.totalSpent)} / {formatCompactINR(summary.totalBudget)} ({spentPct}%)
            </Text>
          </div>
          <div style={{ height: 5, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height:       '100%',
              width:        `${Math.min(spentPct, 100)}%`,
              background:   spentPct >= 100 ? '#B91C1C' : spentPct >= 80 ? '#C27A00' : '#B5451B',
              borderRadius: 99,
              transition:   'width 600ms ease',
            }} />
          </div>
        </div>

        {/* Priorities */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {plan.priorities.map(p => (
            <Badge key={p} size="xs" variant="light" color="brand" style={{ fontSize: 10 }}>
              ★ {p}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default function PlansPage() {
  const [plans, setPlans]   = useState<PlanResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getSavedPlanIds()
    if (ids.length === 0) { setLoading(false); return }

    Promise.all(
      ids.map(id =>
        fetch(`/api/recommendations/${id}`)
          .then(r => r.ok ? (r.json() as Promise<PlanResponse>) : null)
          .catch(() => null)
      )
    ).then(results => {
      setPlans(results.filter((r): r is PlanResponse => r !== null))
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Stack gap="xl">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Text fw={700} size="xl" style={{ color: '#1A1A1A' }}>My Plans</Text>
              <Text size="sm" c="dimmed">All your wedding plans, saved in this browser</Text>
            </div>
            <Button
              component={Link}
              href="/plan/new"
              leftSection={<IconPlus size={15} />}
              style={{ background: '#B5451B' }}
            >
              New Plan
            </Button>
          </div>

          {/* Plans grid */}
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {[1, 2, 3].map(i => <Skeleton key={i} height={200} radius="lg" />)}
            </SimpleGrid>
          ) : plans.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, border: '1px dashed #E5D5CD',
              padding: '60px 32px', textAlign: 'center',
            }}>
              <IconClipboardList size={40} color="#D4B5A8" style={{ marginBottom: 12 }} />
              <Text fw={600} size="md" style={{ color: '#6B6B6B' }}>No plans yet</Text>
              <Text size="sm" c="dimmed" mt={4} mb={20}>
                Create your first wedding plan to get AI-powered budget recommendations.
              </Text>
              <Button component={Link} href="/plan/new" leftSection={<IconPlus size={14} />} style={{ background: '#B5451B' }}>
                Create a Plan
              </Button>
            </div>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ alignItems: 'start' }}>
              {plans.map(p => (
                <PlanCard key={p.plan.id} plan={p.plan} summary={p.summary} />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </div>
    </div>
  )
}
