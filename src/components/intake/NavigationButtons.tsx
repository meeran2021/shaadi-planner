'use client'
import { Button, Group } from '@mantine/core'
import { IconArrowLeft, IconArrowRight, IconSparkles } from '@tabler/icons-react'

interface Props {
  step:       number
  totalSteps: number
  isLoading:  boolean
  onBack:     () => void
  onNext:     () => void
}

export function NavigationButtons({ step, totalSteps, isLoading, onBack, onNext }: Props) {
  const isFirst = step === 1
  const isLast  = step === totalSteps

  return (
    <Group justify="space-between" mt="xl">
      <Button
        variant="subtle"
        color="gray"
        leftSection={<IconArrowLeft size={16} />}
        onClick={onBack}
        style={{ visibility: isFirst ? 'hidden' : 'visible' }}
        disabled={isLoading}
      >
        Back
      </Button>

      <Button
        onClick={onNext}
        loading={isLoading}
        rightSection={!isLoading && isLast ? <IconSparkles size={16} /> : !isLoading ? <IconArrowRight size={16} /> : undefined}
        style={{ background: '#B5451B', minWidth: 160 }}
        size="md"
      >
        {isLoading ? 'Generating…' : isLast ? 'Generate My Plan' : 'Continue'}
      </Button>
    </Group>
  )
}
