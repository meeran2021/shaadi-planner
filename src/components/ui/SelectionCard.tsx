'use client'
import { UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'

interface Props {
  selected: boolean
  onClick:  () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function SelectionCard({ selected, onClick, children, className = '', disabled = false }: Props) {
  return (
    <UnstyledButton
      onClick={onClick}
      disabled={disabled}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        justifyContent:'center',
        gap:           6,
        padding:       '16px 12px',
        borderRadius:  12,
        border:        selected ? '2px solid #B5451B' : '2px solid #E9ECEF',
        background:    selected ? '#FFF0EB' : '#FFFFFF',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        opacity:       disabled ? 0.5 : 1,
        transition:    'border-color 150ms, background 150ms, transform 100ms',
        transform:     selected ? 'scale(1.01)' : 'scale(1)',
        boxShadow:     selected ? '0 2px 8px rgba(181,69,27,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
        textAlign:     'center',
        width:         '100%',
      }}
      className={className}
      onMouseEnter={e => {
        if (!selected && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8A080'
          ;(e.currentTarget as HTMLButtonElement).style.background  = '#FFFAF8'
        }
      }}
      onMouseLeave={e => {
        if (!selected && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E9ECEF'
          ;(e.currentTarget as HTMLButtonElement).style.background  = '#FFFFFF'
        }
      }}
    >
      {children}
    </UnstyledButton>
  )
}
