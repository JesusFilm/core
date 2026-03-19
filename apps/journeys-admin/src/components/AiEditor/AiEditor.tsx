import Box from '@mui/material/Box'
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { GetAdminJourney_journey as Journey } from '../../../__generated__/GetAdminJourney'
import { User } from '../../libs/auth/authContext'

import { AiChatPanel } from './AiChatPanel'
import { AiEditorToolbar } from './AiEditorToolbar'
import { AiJourneyFlow } from './AiJourneyFlow'

const AI_EDITOR_TOOLBAR_HEIGHT = 48

export type AiChatStatus = 'idle' | 'thinking' | 'executing' | 'error'

export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AiPlanOperation {
  id: string
  description: string
  status: 'pending' | 'running' | 'done' | 'failed'
}

export interface AiPlan {
  id: string
  status: 'pending' | 'running' | 'complete' | 'failed' | 'stopped'
  operations: AiPlanOperation[]
}

interface AiEditorProps {
  journey?: Journey
  user?: User
}

export function AiEditor({ journey, user }: AiEditorProps): ReactElement {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [status, setStatus] = useState<AiChatStatus>('idle')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [activeCardIdList] = useState<string[]>([])
  const [plans] = useState<AiPlan[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const activeCardIds = useMemo(
    () => new Set(activeCardIdList),
    [activeCardIdList]
  )

  const handleSendMessage = useCallback(
    (content: string) => {
      const userMessage: AiChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, userMessage])
      setStatus('thinking')
    },
    []
  )

  const handleStopGeneration = useCallback(() => {
    setStatus('idle')
  }, [])

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSendMessage(suggestion)
    },
    [handleSendMessage]
  )

  const handleUndoMessage = useCallback((messageId: string) => {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === messageId)
      if (index === -1) return prev
      return prev.slice(0, index)
    })
  }, [])

  const handleDismissContext = useCallback(() => {
    setSelectedCardId(null)
  }, [])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AiEditorToolbar
        journeyTitle={journey?.title}
        isAiActive={status === 'thinking' || status === 'executing'}
        hasMessages={messages.length > 0}
        onStopGeneration={handleStopGeneration}
      />
      <Box
        sx={{
          display: 'flex',
          height: `calc(100vh - ${AI_EDITOR_TOOLBAR_HEIGHT}px)`,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            flex: 3,
            bgcolor: '#F5F5F5',
            overflow: 'hidden'
          }}
        >
          <ReactFlowProvider>
            <AiJourneyFlow
              journey={journey}
              activeCardIds={activeCardIds}
              selectedCardId={selectedCardId}
              onCardSelect={setSelectedCardId}
            />
          </ReactFlowProvider>
        </Box>
        <Box
          sx={{
            flex: 2,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <AiChatPanel
            messages={messages}
            plans={plans}
            status={status}
            selectedCardId={selectedCardId}
            inputRef={inputRef}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onSuggestionClick={handleSuggestionClick}
            onUndoMessage={handleUndoMessage}
            onDismissContext={handleDismissContext}
          />
        </Box>
      </Box>
    </Box>
  )
}
