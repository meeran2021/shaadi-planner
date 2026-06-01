'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Reveal speed: chars per 16 ms tick (~60 fps).
// 3 chars/tick ≈ 180 chars/sec — feels like fast human typing.
const CHARS_PER_TICK = 3
const TICK_MS = 16

const CHAT_PREFIX = 'shaadi_chat_'

function loadMessages(planId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${CHAT_PREFIX}${planId}`)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch { return [] }
}

function saveMessages(planId: string, msgs: ChatMessage[]) {
  try {
    localStorage.setItem(`${CHAT_PREFIX}${planId}`, JSON.stringify(msgs))
  } catch { /* localStorage unavailable */ }
}

export function useChat(planId: string) {
  const [messages,    setMessages]    = useState<ChatMessage[]>(() => loadMessages(planId))
  const [input,       setInput]       = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // accRef holds the full text received from the server.
  // The typewriter interval reveals it into state incrementally.
  const accRef        = useRef('')
  const serverDoneRef = useRef(false)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)

  // Persist finalized messages (skip mid-stream to avoid saving incomplete assistant bubble)
  useEffect(() => {
    if (!isStreaming) saveMessages(planId, messages)
  }, [messages, isStreaming, planId])

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const stopTypewriter = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTypewriter = useCallback(() => {
    if (timerRef.current) return          // already running

    timerRef.current = setInterval(() => {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (!last || last.role !== 'assistant') { stopTypewriter(); return prev }

        const displayed = last.content
        const target    = accRef.current

        if (displayed.length >= target.length) {
          // Caught up to whatever the server has sent so far.
          // If the server is also finished, we're done entirely.
          if (serverDoneRef.current) {
            stopTypewriter()
            setIsStreaming(false)
          }
          return prev                     // nothing new to show yet
        }

        const next = target.slice(0, displayed.length + CHARS_PER_TICK)
        return [...prev.slice(0, -1), { role: 'assistant' as const, content: next }]
      })
    }, TICK_MS)
  }, [stopTypewriter])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: content.trim() }
    const history = [...messages, userMsg]

    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    // Reset buffers before each new response
    accRef.current        = ''
    serverDoneRef.current = false

    // Start typewriter immediately so dots show right away,
    // and characters drip in as server chunks arrive.
    startTypewriter()

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, messages: history }),
      })

      if (!res.ok || !res.body) throw new Error('Chat request failed')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ') || line.includes('[DONE]')) continue
          try {
            const chunk = JSON.parse(line.slice(6)) as string
            accRef.current += chunk       // buffer — typewriter drip-feeds this
          } catch { /* ignore malformed SSE line */ }
        }
      }
    } catch {
      stopTypewriter()
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." },
      ])
      setIsStreaming(false)
      return
    }

    // Signal to the typewriter that no more chars are coming from the server.
    // It will call setIsStreaming(false) once displayed === accumulated.
    serverDoneRef.current = true
  }, [messages, planId, isStreaming, startTypewriter, stopTypewriter])

  return { messages, input, setInput, sendMessage, isStreaming }
}
