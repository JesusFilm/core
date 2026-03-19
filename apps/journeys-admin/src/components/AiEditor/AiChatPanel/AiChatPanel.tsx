import Box from '@mui/material/Box'
import { ReactElement, RefObject, useEffect, useRef } from 'react'

import {
  AiChatMessage,
  AiChatStatus,
  AiPlan
} from '../AiEditor'

import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { ModelIndicator } from './ModelIndicator'
import { PlanCard } from './PlanCard'
import { StarterSuggestions } from './StarterSuggestions'

interface AiChatPanelProps {
  messages: AiChatMessage[]
  plans: AiPlan[]
  status: AiChatStatus
  selectedCardId: string | null
  inputRef: RefObject<HTMLInputElement | null>
  onSendMessage: (content: string) => void
  onStopGeneration: () => void
  onSuggestionClick: (suggestion: string) => void
  onUndoMessage: (messageId: string) => void
  onDismissContext: () => void
}

export function AiChatPanel({
  messages,
  plans,
  status,
  selectedCardId,
  inputRef,
  onSendMessage,
  onStopGeneration,
  onSuggestionClick,
  onUndoMessage,
  onDismissContext
}: AiChatPanelProps): ReactElement {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <Box
      data-testid="AiChatPanel"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          pt: 2,
          pb: 1
        }}
      >
        {!hasMessages ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <StarterSuggestions onSuggestionClick={onSuggestionClick} />
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const planForMessage = plans.find(
                (_, planIndex) =>
                  messages.filter((m) => m.role === 'assistant').indexOf(message) === planIndex
              )
              return (
                <Box key={message.id} sx={{ mb: 2 }}>
                  <MessageBubble
                    message={message}
                    onUndo={
                      message.role === 'user'
                        ? () => onUndoMessage(message.id)
                        : undefined
                    }
                  />
                  {message.role === 'assistant' && planForMessage != null && (
                    <Box sx={{ mt: 1, ml: 5 }}>
                      <PlanCard plan={planForMessage} />
                    </Box>
                  )}
                </Box>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Box sx={{ px: 3, pb: 2, pt: 1, flexShrink: 0 }}>
        <ModelIndicator isConnected={false} />
        <ChatInput
          inputRef={inputRef}
          status={status}
          selectedCardId={selectedCardId}
          onSendMessage={onSendMessage}
          onStopGeneration={onStopGeneration}
          onDismissContext={onDismissContext}
        />
      </Box>
    </Box>
  )
}
