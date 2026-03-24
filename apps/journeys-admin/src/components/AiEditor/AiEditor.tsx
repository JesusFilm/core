import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { ReactFlowProvider } from 'reactflow'

import { GetAdminJourney_journey as Journey } from '../../../__generated__/GetAdminJourney'
import { User } from '../../libs/auth/authContext'
import { useJourneyAiChatSubscription } from '../../libs/useJourneyAiChatSubscription/useJourneyAiChatSubscription'

import { AiChatPanel } from './AiChatPanel'
import { AiEditorToolbar } from './AiEditorToolbar'
import { AiJourneyFlow } from './AiJourneyFlow'

const EXECUTE_PLAN = gql`
  mutation JourneyAiChatExecutePlan($turnId: String!) {
    journeyAiChatExecutePlan(turnId: $turnId)
  }
`

const AI_EDITOR_TOOLBAR_HEIGHT = 48

export type AiChatStatus = 'idle' | 'thinking' | 'executing' | 'error'

export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant' | 'plan'
  content: string
  timestamp: Date
  plan?: AiPlan
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
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const [status, setStatus] = useState<AiChatStatus>('idle')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [plans, setPlans] = useState<AiPlan[]>([])
  const currentAssistantIdRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const subscription = useJourneyAiChatSubscription()

  // Resolve selected card heading for the context chip
  const selectedCardLabel = useMemo(() => {
    if (selectedCardId == null || journey?.blocks == null) return undefined
    const step = journey.blocks.find(
      (b) => b.id === selectedCardId && b.__typename === 'StepBlock'
    )
    if (step == null) return undefined
    const card = journey.blocks.find(
      (b) => b.parentBlockId === step.id && b.__typename === 'CardBlock'
    )
    if (card == null) return undefined
    const heading = journey.blocks.find(
      (b) =>
        b.parentBlockId === card.id &&
        b.__typename === 'TypographyBlock' &&
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          (b as { variant?: string }).variant ?? ''
        )
    )
    return (heading as { content?: string })?.content ?? undefined
  }, [selectedCardId, journey?.blocks])

  const activeCardIds = subscription.activeCardIds

  // Sync subscription state → local status
  useEffect(() => {
    if (!subscription.isActive && status === 'thinking') {
      setStatus('idle')
    }
  }, [subscription.isActive, status])

  // Convert subscription messages into assistant chat messages and plans
  useEffect(() => {
    const subMessages = subscription.messages
    if (subMessages.length === 0) return

    // Build assistant text from coalesced text messages
    const textParts: string[] = []
    const planMap = new Map<string, AiPlan>()

    for (const msg of subMessages) {
      if (msg.type === 'text' && msg.text != null) {
        textParts.push(msg.text)
      }

      if (msg.type === 'plan' && msg.operations != null) {
        try {
          const ops = JSON.parse(msg.operations) as Array<{
            id: string
            description: string
          }>
          const planId = msg.turnId ?? crypto.randomUUID()
          planMap.set(planId, {
            id: planId,
            status: msg.requiresConfirmation ? 'pending' : 'running',
            operations: ops.map((op) => ({
              id: op.id,
              description: op.description,
              status: 'pending'
            }))
          })
        } catch {
          // ignore malformed operations
        }
      }

      if (msg.type === 'plan_progress' && msg.operationId != null) {
        for (const plan of planMap.values()) {
          const op = plan.operations.find((o) => o.id === msg.operationId)
          if (op != null) {
            op.status =
              msg.status === 'done'
                ? 'done'
                : msg.status === 'error'
                  ? 'failed'
                  : 'running'
          }
        }
      }

      if (msg.type === 'error') {
        setStatus('error')
      }

      if (msg.type === 'done') {
        setStatus('idle')
        for (const plan of planMap.values()) {
          if (plan.status === 'running') {
            plan.status = msg.journeyUpdated ? 'complete' : 'failed'
            if (msg.journeyUpdated) {
              for (const op of plan.operations) {
                if (op.status === 'pending' || op.status === 'running') {
                  op.status = 'done'
                }
              }
            }
          }
        }
      }
    }

    // Update assistant text message in chat
    setChatMessages((prev) => {
      const updated = [...prev]

      if (textParts.length > 0) {
        const assistantText = textParts.join('')
        const currentId = currentAssistantIdRef.current
        const existingIdx = currentId != null
          ? updated.findIndex((m) => m.id === currentId)
          : -1

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            content: assistantText
          }
        } else {
          const newId = crypto.randomUUID()
          currentAssistantIdRef.current = newId
          updated.push({
            id: newId,
            role: 'assistant',
            content: assistantText,
            timestamp: new Date()
          })
        }
      }

      // Upsert plan messages into history
      for (const plan of planMap.values()) {
        const existingIdx = updated.findIndex(
          (m) => m.role === 'plan' && m.plan?.id === plan.id
        )
        const planMessage: AiChatMessage = {
          id: plan.id,
          role: 'plan',
          content: '',
          timestamp: new Date(),
          plan
        }
        if (existingIdx >= 0) {
          updated[existingIdx] = planMessage
        } else {
          updated.push(planMessage)
        }
      }

      return updated
    })

    setPlans(Array.from(planMap.values()))
  }, [subscription.messages])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (journey == null) return

      const userMessage: AiChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date()
      }
      setChatMessages((prev) => [...prev, userMessage])
      currentAssistantIdRef.current = null
      setStatus('thinking')

      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content
      }))

      const langName =
        journey.language?.name?.find(({ primary }) => !primary)?.value ??
        undefined

      subscription.send({
        journeyId: journey.id,
        message: content,
        history,
        contextCardId: selectedCardId ?? undefined,
        languageName: langName
      })
    },
    [journey, chatMessages, selectedCardId, subscription]
  )

  const handleStopGeneration = useCallback(() => {
    subscription.stop()
    setStatus('idle')
  }, [subscription])

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSendMessage(suggestion)
    },
    [handleSendMessage]
  )

  const handleUndoMessage = useCallback((messageId: string) => {
    setChatMessages((prev) => {
      const index = prev.findIndex((m) => m.id === messageId)
      if (index === -1) return prev
      return prev.slice(0, index)
    })
  }, [])

  const handleDismissContext = useCallback(() => {
    setSelectedCardId(null)
  }, [])

  const [executePlan] = useMutation(EXECUTE_PLAN, {
    refetchQueries: ['GetAdminJourney']
  })

  const handleConfirmPlan = useCallback(
    async (planId: string) => {
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, status: 'running' as const } : p))
      )
      setStatus('executing')
      try {
        await executePlan({ variables: { turnId: planId } })
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  status: 'complete' as const,
                  operations: p.operations.map((op) => ({
                    ...op,
                    status: 'done' as const
                  }))
                }
              : p
          )
        )
        setStatus('idle')
      } catch {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId ? { ...p, status: 'failed' as const } : p
          )
        )
        setStatus('error')
      }
    },
    [executePlan]
  )

  const handleRejectPlan = useCallback((planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, status: 'stopped' as const } : p
      )
    )
  }, [])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AiEditorToolbar
        journeyTitle={journey?.title}
        hasMessages={chatMessages.length > 0}
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
            flex: 7,
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
            flex: 3,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <AiChatPanel
            messages={chatMessages}
            plans={plans}
            status={status}
            selectedCardId={selectedCardId}
            selectedCardLabel={selectedCardLabel}
            inputRef={inputRef}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onSuggestionClick={handleSuggestionClick}
            onUndoMessage={handleUndoMessage}
            onDismissContext={handleDismissContext}
            onConfirmPlan={handleConfirmPlan}
            onRejectPlan={handleRejectPlan}
          />
        </Box>
      </Box>
    </Box>
  )
}
