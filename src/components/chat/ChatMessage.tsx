'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { ChatMessage as ChatMessageType } from '@/src/hooks/useChat'

interface Props {
  message:      ChatMessageType
  isStreaming?: boolean
}

const mdComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  // suppress default wrapper divs so paragraphs render cleanly
  p: ({ children }) => <p>{children}</p>,
}

export function ChatMessage({ message, isStreaming }: Props) {
  const isUser      = message.role === 'user'
  const showCursor  = isStreaming && !isUser

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <div style={{
          maxWidth:     '72%',
          padding:      '10px 14px',
          borderRadius: '18px 18px 4px 18px',
          background:   '#B5451B',
          color:        'white',
          boxShadow:    '0 2px 8px rgba(181,69,27,0.25)',
          fontSize:     14,
          lineHeight:   1.5,
          whiteSpace:   'pre-wrap',
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width:        28, height: 28, borderRadius: '50%',
        background:   '#B5451B', color: 'white',
        display:      'flex', alignItems: 'center', justifyContent: 'center',
        fontSize:     11, fontWeight: 700, flexShrink: 0,
        marginRight:  8, marginTop:   4,
        letterSpacing: '0.02em',
      }}>
        AI
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:     '78%',
        padding:      '10px 14px',
        borderRadius: '4px 18px 18px 18px',
        background:   '#F3F4F6',
        boxShadow:    '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {message.content ? (
          <>
            <div className="md-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
            {showCursor && <span className="stream-cursor" />}
          </>
        ) : (
          /* Typing dots while waiting for first chunk */
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#B5451B', opacity: 0.6,
                display: 'inline-block',
                animation: `blink 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
