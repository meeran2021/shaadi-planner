'use client'
import { Skeleton, Button, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { RecommendationCard } from './RecommendationCard'
import { AddCategoryModal }   from './AddCategoryModal'
import type { Recommendation, Payment } from '@/src/types'

interface Props {
  recommendations: Recommendation[]
  payments:        Payment[]
  planId:          string
  isLoading:       boolean
}

export function RecommendationGrid({ recommendations, payments, planId, isLoading }: Props) {
  const [addOpen, { open: openAdd, close: closeAdd }] = useDisclosure(false)

  if (isLoading) {
    return (
      <div style={{ columns: '2 340px', columnGap: 16 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ breakInside: 'avoid', marginBottom: 16 }}>
            <Skeleton height={200} radius="lg" />
          </div>
        ))}
      </div>
    )
  }

  const sorted = [...recommendations].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      {/* Masonry columns — cards stack naturally by height, no row stretching */}
      <div style={{ columns: '2 340px', columnGap: 16 }}>
        {sorted.map(rec => (
          <div key={rec.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
            <RecommendationCard
              recommendation={rec}
              payments={payments.filter(p => p.recommendationId === rec.id)}
              planId={planId}
            />
          </div>
        ))}
      </div>

      <Group justify="center" mt="md">
        <Button
          variant="outline"
          color="brand"
          leftSection={<IconPlus size={15} />}
          onClick={openAdd}
          style={{ borderStyle: 'dashed', borderColor: '#B5451B', color: '#B5451B' }}
        >
          Add Category
        </Button>
      </Group>

      <AddCategoryModal opened={addOpen} onClose={closeAdd} planId={planId} />
    </>
  )
}
