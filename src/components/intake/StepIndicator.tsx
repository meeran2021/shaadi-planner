'use client'
import { Text } from '@mantine/core'

interface Props {
  current: number
  total:   number
}

export function StepIndicator({ current, total }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => {
        const step   = i + 1
        const active = step === current
        const done   = step < current
        return (
          <div
            key={step}
            style={{
              height:       4,
              flex:         active ? 2 : 1,
              borderRadius: 4,
              background:   done || active ? '#B5451B' : '#E9ECEF',
              transition:   'all 300ms ease',
              opacity:      done ? 0.5 : 1,
            }}
          />
        )
      })}
      <Text size="xs" c="dimmed" ml={4} style={{ whiteSpace: 'nowrap' }}>
        {current} / {total}
      </Text>
    </div>
  )
}
