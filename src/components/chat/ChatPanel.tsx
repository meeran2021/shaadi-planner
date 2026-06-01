'use client'
import { useEffect, useRef, useState } from 'react'
import { Text, UnstyledButton } from '@mantine/core'
import { IconMessageCircle, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useChat } from '@/src/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput }   from './ChatInput'

interface Props {
  planId: string
}

const SUGGESTED = [
  'Which vendors should I book first?',
  'How do I negotiate with caterers?',
  'What are good photographers in my city?',
]

export function ChatPanel({ planId }: Props) {
  const { messages, input, setInput, sendMessage, isStreaming } = useChat(planId)
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  return (
    <div style={{
      borderRadius: 16,
      border:       '1px solid #F0F0F0',
      background:   'white',
      overflow:     'hidden',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* Header / toggle */}
      <UnstyledButton
        onClick={() => setOpen(o => !o)}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          width:          '100%',
          padding:        '16px 20px',
          borderBottom:   open ? '1px solid #F0F0F0' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#FFF0EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconMessageCircle size={17} style={{ color: '#B5451B' }} />
          </div>
          <div>
            <Text fw={600} size="sm">Ask your planner AI</Text>
            <Text size="xs" c="dimmed">Get answers specific to your plan</Text>
          </div>
        </div>
        {open ? <IconChevronUp size={18} color="#6B7280" /> : <IconChevronDown size={18} color="#6B7280" />}
      </UnstyledButton>

      {open && (
        <>
          {/* Message list */}
          <div style={{
            minHeight: 240,
            maxHeight: 480,
            overflowY: 'auto',
            padding:   '16px 16px 8px',
          }}>
            {messages.length === 0 && (
              <div>
                <Text size="sm" c="dimmed" ta="center" mb={16}>
                  Ask anything about vendors, budgets, or planning tips for your wedding.
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {SUGGESTED.map(q => (
                    <UnstyledButton
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isStreaming}
                      style={{
                        padding:      '6px 14px',
                        borderRadius: 20,
                        border:       '1px solid #E9ECEF',
                        background:   '#FAFAFA',
                        fontSize:     12,
                        color:        '#374151',
                        cursor:       isStreaming ? 'not-allowed' : 'pointer',
                        opacity:      isStreaming ? 0.5 : 1,
                      }}
                    >
                      {q}
                    </UnstyledButton>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage(input)}
            isStreaming={isStreaming}
          />
        </>
      )}
    </div>
  )
}
