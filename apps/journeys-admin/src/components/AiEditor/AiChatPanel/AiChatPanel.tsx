import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { keyframes } from '@mui/material/styles'
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

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`

function ThinkingIndicator(): ReactElement {
  return (
    <Stack
      data-testid="ThinkingIndicator"
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{ mb: 2 }}
    >
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: '#F5F5F5',
          flexShrink: 0
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Avatar>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ pt: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'text.disabled',
              animation: `${bounce} 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`
            }}
          />
        ))}
      </Stack>
    </Stack>
  )
}

interface AiChatPanelProps {
  messages: AiChatMessage[]
  plans: AiPlan[]
  status: AiChatStatus
  selectedCardId: string | null
  selectedCardLabel?: string
  inputRef: RefObject<HTMLInputElement | null>
  onSendMessage: (content: string) => void
  onStopGeneration: () => void
  onSuggestionClick: (suggestion: string) => void
  onUndoMessage: (messageId: string) => void
  onDismissContext: () => void
  onConfirmPlan?: (planId: string) => void
  onRejectPlan?: (planId: string) => void
}

export function AiChatPanel({
  messages,
  plans,
  status,
  selectedCardId,
  selectedCardLabel,
  inputRef,
  onSendMessage,
  onStopGeneration,
  onSuggestionClick,
  onUndoMessage,
  onDismissContext,
  onConfirmPlan,
  onRejectPlan
}: AiChatPanelProps): ReactElement {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0
  const lastMessage = messages[messages.length - 1]
  const showThinking =
    status === 'thinking' &&
    (lastMessage == null || lastMessage.role === 'user')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, showThinking, plans.length])

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
            {messages.map((message) => (
              <Box key={message.id} sx={{ mb: 2 }}>
                {message.role === 'plan' && message.plan != null ? (
                  <Box sx={{ ml: 5 }}>
                    <PlanCard
                      plan={message.plan}
                      onConfirm={onConfirmPlan}
                      onReject={onRejectPlan}
                    />
                  </Box>
                ) : (
                  <MessageBubble
                    message={message}
                    onUndo={
                      message.role === 'user'
                        ? () => onUndoMessage(message.id)
                        : undefined
                    }
                  />
                )}
              </Box>
            ))}
            {showThinking && <ThinkingIndicator />}
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
          selectedCardLabel={selectedCardLabel}
          onSendMessage={onSendMessage}
          onStopGeneration={onStopGeneration}
          onDismissContext={onDismissContext}
        />
      </Box>
    </Box>
  )
}
