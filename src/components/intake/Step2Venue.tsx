'use client'
import { Title, Text, Stack, SimpleGrid, TextInput, Group } from '@mantine/core'
import {
  IconMapPin, IconBuildingBank, IconHome, IconBuildingCastle,
  IconPlaneDeparture, IconHomeHeart,
} from '@tabler/icons-react'
import { SelectionCard } from '../ui/SelectionCard'
import type { VenueType } from '@/src/types'

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Udaipur', 'Goa']

const VENUE_OPTIONS: { value: VenueType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'banquet_hall',       label: 'Banquet Hall',       icon: <IconBuildingBank size={22} />,    desc: 'AC hall with full service' },
  { value: 'farmhouse',          label: 'Farmhouse',          icon: <IconHome size={22} />,            desc: 'Open-air & scenic' },
  { value: 'heritage_property',  label: 'Heritage Property',  icon: <IconBuildingCastle size={22} />,  desc: 'Palace or haveli' },
  { value: 'destination',        label: 'Destination',        icon: <IconPlaneDeparture size={22} />,  desc: 'Beach, hill station' },
  { value: 'home',               label: 'At Home',            icon: <IconHomeHeart size={22} />,       desc: 'Intimate & personal' },
]

interface Props {
  city:      string
  venueType: VenueType | ''
  errors:    Record<string, string>
  onChange:  (field: 'city' | 'venueType', value: string) => void
}

export function Step2Venue({ city, venueType, errors, onChange }: Props) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ color: '#1A1A1A', fontWeight: 700 }}>
          Where are you celebrating?
        </Title>
        <Text c="dimmed" mt={4} size="sm">
          Location shapes every budget decision.
        </Text>
      </div>

      <div>
        <TextInput
          label="City"
          placeholder="e.g. Mumbai, Jaipur, Udaipur…"
          value={city}
          onChange={e => onChange('city', e.currentTarget.value)}
          error={errors.city}
          leftSection={<IconMapPin size={16} />}
          size="md"
          required
        />
        {!city && (
          <Group gap={6} mt={8} wrap="wrap">
            {POPULAR_CITIES.map(c => (
              <button
                key={c}
                onClick={() => onChange('city', c)}
                style={{
                  padding:      '3px 10px',
                  borderRadius: 20,
                  border:       '1px solid #E9ECEF',
                  background:   '#F8F9FA',
                  cursor:       'pointer',
                  fontSize:     12,
                  color:        '#495057',
                  transition:   'all 120ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background     = '#FFF0EB'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor   = '#B5451B'
                  ;(e.currentTarget as HTMLButtonElement).style.color         = '#B5451B'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background     = '#F8F9FA'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor   = '#E9ECEF'
                  ;(e.currentTarget as HTMLButtonElement).style.color         = '#495057'
                }}
              >
                {c}
              </button>
            ))}
          </Group>
        )}
      </div>

      <div>
        <Text fw={500} mb="xs" size="sm">Venue type</Text>
        <SimpleGrid cols={2} spacing="sm">
          {VENUE_OPTIONS.map(opt => (
            <SelectionCard
              key={opt.value}
              selected={venueType === opt.value}
              onClick={() => onChange('venueType', opt.value)}
            >
              <div style={{ color: venueType === opt.value ? '#B5451B' : '#6B6B6B' }}>
                {opt.icon}
              </div>
              <Text fw={600} size="sm">{opt.label}</Text>
              <Text size="xs" c="dimmed">{opt.desc}</Text>
            </SelectionCard>
          ))}
        </SimpleGrid>
        {errors.venueType && (
          <Text c="red" size="xs" mt={6}>{errors.venueType}</Text>
        )}
      </div>
    </Stack>
  )
}
