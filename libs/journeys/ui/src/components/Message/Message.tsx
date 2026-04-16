import { CSSProperties, ReactElement, ReactNode } from 'react'

import { Avatar } from '../Avatar'

type MessageRole = 'user' | 'assistant'

interface MessageProps {
  role: MessageRole
  children: ReactNode
}

const containerStyles: Record<MessageRole, CSSProperties> = {
  user: {
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: 8,
    padding: '4px 16px'
  },
  assistant: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    padding: '4px 16px'
  }
}

const bubbleStyles: Record<MessageRole, CSSProperties> = {
  user: {
    backgroundColor: '#6D28D9',
    color: 'white',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: 'break-word'
  },
  assistant: {
    backgroundColor: '#f3f4f6',
    color: '#1a1a1a',
    borderRadius: '16px 16px 16px 4px',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: 'break-word'
  }
}

export function Message({ role, children }: MessageProps): ReactElement {
  return (
    <div style={containerStyles[role]}>
      {role === 'assistant' && (
        <Avatar fallback="AI" size={28} />
      )}
      <div style={bubbleStyles[role]}>{children}</div>
    </div>
  )
}
