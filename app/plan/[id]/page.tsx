'use client'
import { SimpleGrid, Skeleton, Stack, Text, Button, Alert } from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconLayoutList } from '@tabler/icons-react'
import Link from 'next/link'

import { usePlan } from '@/src/hooks/usePlan'
import { PlanHeader }          from '@/src/components/recommendations/PlanHeader'
import { BudgetSummary }       from '@/src/components/budget/BudgetSummary'
import { RecommendationGrid }  from '@/src/components/recommendations/RecommendationGrid'
import { ChatPanel }           from '@/src/components/chat/ChatPanel'

interface Props {
  params: { id: string }
}

function PlanSkeleton() {
  return (
    <Stack gap="xl">
      {/* Header skeleton */}
      <Skeleton height={148} radius={16} />

      {/* Budget summary skeleton */}
      <div>
        <Skeleton height={20} width={160} mb="sm" radius="md" />
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
          {[1, 2, 3].map(i => <Skeleton key={i} height={90} radius={14} />)}
        </SimpleGrid>
      </div>

      {/* Recommendation grid skeleton */}
      <div>
        <Skeleton height={20} width={220} mb="sm" radius="md" />
        <RecommendationGrid
          recommendations={[]}
          payments={[]}
          planId=""
          isLoading={true}
        />
      </div>
    </Stack>
  )
}

function PlanPageContent({ planId }: { planId: string }) {
  const { data, isLoading, error } = usePlan(planId)

  if (error?.message === 'Plan not found') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FDF6EE', padding: 24,
      }}>
        <Stack align="center" gap="md" style={{ maxWidth: 400 }}>
          <Alert
            color="red"
            title="Plan not found"
            icon={<IconAlertCircle size={18} />}
            style={{ width: '100%' }}
          >
            We couldn&apos;t find a plan with this ID. It may have been deleted.
          </Alert>
          <Button component={Link} href="/plan/new" leftSection={<IconArrowLeft size={14} />} style={{ background: '#B5451B' }}>
            Create a new plan
          </Button>
        </Stack>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FDF6EE', padding: 24,
      }}>
        <Alert color="red" title="Error loading plan" icon={<IconAlertCircle size={18} />}>
          {error.message}
        </Alert>
      </div>
    )
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#FDF6EE',
      padding:    'clamp(16px, 4vw, 32px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Nav */}
        <div style={{ marginBottom: 20 }}>
          <Button
            component={Link}
            href="/plans"
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconLayoutList size={13} />}
            style={{ color: '#6B6B6B' }}
          >
            My Plans
          </Button>
        </div>

        {isLoading ? (
          <PlanSkeleton />
        ) : data ? (
          <Stack gap="xl">
            <PlanHeader plan={data.plan} />

            <div>
              <Text fw={700} size="lg" mb="sm" style={{ color: '#1A1A1A' }}>Budget Overview</Text>
              <BudgetSummary summary={data.summary} />
            </div>

            <div>
              <Text fw={700} size="lg" mb="sm" style={{ color: '#1A1A1A' }}>
                Your Wedding Plan ({data.recommendations.length} categories)
              </Text>
              <RecommendationGrid
                recommendations={data.recommendations}
                payments={data.payments}
                planId={planId}
                isLoading={false}
              />
            </div>

            <ChatPanel planId={planId} />
          </Stack>
        ) : null}
      </div>
    </div>
  )
}

export default function PlanPage({ params }: Props) {
  return <PlanPageContent planId={params.id} />
}
