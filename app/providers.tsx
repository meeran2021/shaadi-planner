'use client'

import { MantineProvider, createTheme } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#FFF0EB', '#FDDDD0', '#F8B99B', '#F19266', '#EA6C3A',
      '#B5451B', '#9A3817', '#7D2C12', '#61210D', '#461808',
    ],
    gold: [
      '#FDF8EC', '#FAF0D0', '#F2DC9A', '#E9C76A', '#DFB23F',
      '#C9973A', '#A87B2E', '#875F23', '#664518', '#472F10',
    ],
  },
  primaryShade: { light: 5, dark: 6 },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  focusRing: 'auto',
  components: {
    Button: {
      defaultProps: { radius: 'md' },
    },
    Card: {
      defaultProps: { radius: 'lg', shadow: 'sm' },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Textarea: {
      defaultProps: { radius: 'md' },
    },
    NumberInput: {
      defaultProps: { radius: 'md' },
    },
    DateInput: {
      defaultProps: { radius: 'md' },
    },
    Modal: {
      defaultProps: { radius: 'lg' },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60_000, retry: 1 },
      },
    })
  )

  return (
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ locale: 'en' }}>
        <QueryClientProvider client={queryClient}>
          <Notifications position="top-right" zIndex={9999} />
          <ModalsProvider>
            {children}
          </ModalsProvider>
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  )
}
