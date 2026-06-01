'use client'
import { Title, Text, Stack, SimpleGrid, Badge } from '@mantine/core'
import {
  IconCamera, IconToolsKitchen2, IconFlower, IconMusic,
  IconDiamond, IconBuildingArch, IconPalette, IconMail,
} from '@tabler/icons-react'
import { SelectionCard } from '../ui/SelectionCard'

const PRIORITY_OPTIONS = [
  { value: 'Photography & Videography', icon: <IconCamera size={24} />,        label: 'Photography' },
  { value: 'Food & Catering',           icon: <IconToolsKitchen2 size={24} />, label: 'Food & Catering' },
  { value: 'Décor & Florals',           icon: <IconFlower size={24} />,        label: 'Décor & Florals' },
  { value: 'Music & Entertainment',     icon: <IconMusic size={24} />,         label: 'Entertainment' },
  { value: 'Bridal Wear & Jewellery',   icon: <IconDiamond size={24} />,       label: 'Bridal Wear' },
  { value: 'Venue',                     icon: <IconBuildingArch size={24} />,  label: 'Venue' },
  { value: 'Mehendi & Beauty',          icon: <IconPalette size={24} />,       label: 'Mehendi & Beauty' },
  { value: 'Invitation & Stationery',   icon: <IconMail size={24} />,          label: 'Stationery' },
]

interface Props {
  priorities: string[]
  errors:     Record<string, string>
  onChange:   (field: 'priorities', value: string[]) => void
}

export function Step4Priorities({ priorities, errors, onChange }: Props) {
  const handleToggle = (value: string) => {
    if (priorities.includes(value)) {
      onChange('priorities', priorities.filter(p => p !== value))
    } else if (priorities.length < 2) {
      onChange('priorities', [...priorities, value])
    } else {
      // FIFO: drop the first selected, add new
      onChange('priorities', [priorities[1], value])
    }
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ color: '#1A1A1A', fontWeight: 700 }}>
          What matters most to you?
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          Choose your top 2 priorities — these get higher budget allocations.
        </Text>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text size="sm" fw={500}>Select 2 categories</Text>
          <Badge
            color={priorities.length === 2 ? 'green' : 'gray'}
            variant="light"
            size="sm"
          >
            {priorities.length} / 2 selected
          </Badge>
        </div>

        <SimpleGrid cols={2} spacing="sm">
          {PRIORITY_OPTIONS.map((opt) => {
            const selected = priorities.includes(opt.value)
            const rank     = priorities.indexOf(opt.value) + 1
            return (
              <div key={opt.value} style={{ position: 'relative' }}>
                <SelectionCard
                  selected={selected}
                  onClick={() => handleToggle(opt.value)}
                >
                  <div style={{ color: selected ? '#B5451B' : '#6B7280', marginBottom: 2 }}>
                    {opt.icon}
                  </div>
                  <Text fw={600} size="sm">{opt.label}</Text>
                </SelectionCard>
                {selected && (
                  <div style={{
                    position:   'absolute',
                    top:        -8,
                    right:      -8,
                    width:      22,
                    height:     22,
                    borderRadius: '50%',
                    background: '#B5451B',
                    color:      'white',
                    display:    'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize:   12,
                    fontWeight: 700,
                    boxShadow:  '0 1px 4px rgba(181,69,27,0.4)',
                  }}>
                    {rank}
                  </div>
                )}
              </div>
            )
          })}
        </SimpleGrid>

        {errors.priorities && (
          <Text c="red" size="xs" mt={6}>{errors.priorities}</Text>
        )}
      </div>
    </Stack>
  )
}
