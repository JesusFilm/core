import { ReactElement, ReactNode, useRef } from 'react'
import { useStickToBottom } from 'use-stick-to-bottom'

interface ConversationProps {
  children: ReactNode
}

export function Conversation({ children }: ConversationProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollRef: stickRef, contentRef } = useStickToBottom()

  return (
    <div
      ref={(node) => {
        scrollRef.current = node
        stickRef.current = node
      }}
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingTop: 8,
          paddingBottom: 8
        }}
      >
        {children}
      </div>
    </div>
  )
}
