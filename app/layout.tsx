import type { Metadata } from 'next'
import { ColorSchemeScript } from '@mantine/core'
import { Providers } from './providers'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shaadi Planner — AI-powered Indian Wedding Planner',
  description: 'Get a personalised vendor budget plan for your Indian wedding in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
