'use client'
import { type KeyboardEvent } from 'react'
import { Textarea, ActionIcon } from '@mantine/core'
import { IconSend2 } from '@tabler/icons-react'

interface Props {
  value:       string
  onChange:    (v: string) => void
  onSend:      () => void
  isStreaming: boolean
}

export function ChatInput({ value, onChange, onSend, isStreaming }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div style={{
      display:     'flex',
      gap:         8,
      alignItems:  'flex-end',
      padding:     '12px 16px',
      borderTop:   '1px solid #F0F0F0',
      background:  'white',
    }}>
      <Textarea
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your wedding plan… (Enter to send)"
        autosize
        minRows={1}
        maxRows={4}
        style={{ flex: 1 }}
        disabled={isStreaming}
        styles={{
          input: { borderColor: '#E9ECEF', borderRadius: 12 },
        }}
      />
      <ActionIcon
        onClick={onSend}
        disabled={!value.trim() || isStreaming}
        loading={isStreaming}
        size="lg"
        style={{
          background:   !value.trim() || isStreaming ? '#E9ECEF' : '#B5451B',
          color:        'white',
          borderRadius: 10,
          flexShrink:   0,
        }}
      >
        <IconSend2 size={16} />
      </ActionIcon>
    </div>
  )
}
