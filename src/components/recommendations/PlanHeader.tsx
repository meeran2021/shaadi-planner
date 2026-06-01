'use client'
import { Group, Text, Badge, Button } from '@mantine/core'
import { IconCalendar, IconUsers, IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'
import type { IntakePlan } from '@/src/types'

const VENUE_LABELS: Record<string, string> = {
  banquet_hall:      'Banquet Hall',
  farmhouse:         'Farmhouse',
  heritage_property: 'Heritage Property',
  destination:       'Destination',
  home:              'At Home',
}

interface Props {
  plan: IntakePlan
}

export function PlanHeader({ plan }: Props) {
  const weddingDate = new Date(plan.weddingDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const daysLeft = Math.ceil(
    (new Date(plan.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div style={{
      background:   'linear-gradient(135deg, #B5451B 0%, #9A3817 100%)',
      borderRadius: 16,
      padding:      'clamp(20px, 4vw, 32px)',
      color:        'white',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text size="xs" style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Wedding Budget Plan
          </Text>
          <Text fw={700} size="xl" mt={4} style={{ lineHeight: 1.2 }}>
            {plan.city}
          </Text>
          <Text size="sm" mt={2} style={{ opacity: 0.85 }}>
            {VENUE_LABELS[plan.venueType] ?? plan.venueType}
          </Text>
        </div>
        {daysLeft > 0 && (
          <Badge
            size="lg"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
          >
            {daysLeft} days to go
          </Badge>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <Group gap={6}>
          <IconCalendar size={14} style={{ opacity: 0.75 }} />
          <Text size="sm" style={{ opacity: 0.9 }}>{weddingDate}</Text>
        </Group>
        <Group gap={6}>
          <IconUsers size={14} style={{ opacity: 0.75 }} />
          <Text size="sm" style={{ opacity: 0.9 }}>{plan.guestCount} guests</Text>
        </Group>
        <Group gap={6}>
          <Text size="sm" style={{ opacity: 0.9 }}>
            ★ {plan.priorities.join(' · ')}
          </Text>
        </Group>
      </div>

      <div style={{ marginTop: 16 }}>
        <Button
          component={Link}
          href="/plan/new"
          variant="white"
          size="xs"
          leftSection={<IconArrowLeft size={12} />}
          style={{ color: '#B5451B' }}
        >
          Start new plan
        </Button>
      </div>
    </div>
  )
}
