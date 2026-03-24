import { gql, useApolloClient, useSubscription } from '@apollo/client'
import { useCallback, useRef, useState } from 'react'

export interface JourneyAiChatMessage {
  type: string
  text?: string | null
  operations?: string | null
  operationId?: string | null
  status?: string | null
  turnId?: string | null
  journeyUpdated?: boolean | null
  requiresConfirmation?: boolean | null
  name?: string | null
  args?: string | null
  summary?: string | null
  cardId?: string | null
  error?: string | null
  validation?: string | null
}

interface JourneyAiChatInput {
  journeyId: string
  message: string
  history: Array<{ role: string; content: string }>
  turnId?: string
  contextCardId?: string
  preferredTier?: 'free' | 'premium'
  languageName?: string
}

interface UseJourneyAiChatSubscriptionReturn {
  messages: JourneyAiChatMessage[]
  activeCardIds: Set<string>
  isActive: boolean
  send: (input: JourneyAiChatInput) => void
  stop: () => void
}

export const JOURNEY_AI_CHAT_SUBSCRIPTION = gql`
  subscription JourneyAiChatCreateSubscription(
    $input: JourneyAiChatInput!
  ) {
    journeyAiChatCreateSubscription(input: $input) {
      type
      text
      operations
      operationId
      status
      turnId
      journeyUpdated
      requiresConfirmation
      name
      args
      summary
      cardId
      error
      validation
    }
  }
`

function coalesceTextDelta(
  messages: JourneyAiChatMessage[],
  incoming: JourneyAiChatMessage
): JourneyAiChatMessage[] {
  if (incoming.type !== 'text') return [...messages, incoming]

  const last = messages[messages.length - 1]
  if (last?.type === 'text') {
    const merged: JourneyAiChatMessage = {
      ...last,
      text: (last.text ?? '') + (incoming.text ?? '')
    }
    return [...messages.slice(0, -1), merged]
  }

  return [...messages, incoming]
}

export function useJourneyAiChatSubscription(): UseJourneyAiChatSubscriptionReturn {
  const client = useApolloClient()
  const [subscriptionInput, setSubscriptionInput] =
    useState<JourneyAiChatInput | null>(null)
  const [messages, setMessages] = useState<JourneyAiChatMessage[]>([])
  const [activeCardIds, setActiveCardIds] = useState<Set<string>>(new Set())
  const activeCardIdsRef = useRef<Set<string>>(new Set())

  useSubscription(JOURNEY_AI_CHAT_SUBSCRIPTION, {
    variables: { input: subscriptionInput },
    skip: subscriptionInput == null,
    onData({ data: { data } }) {
      const event = data?.journeyAiChatCreateSubscription
      if (event == null) return

      const message: JourneyAiChatMessage = {
        type: event.type ?? '',
        text: event.text,
        operations: event.operations,
        operationId: event.operationId,
        status: event.status,
        turnId: event.turnId,
        journeyUpdated: event.journeyUpdated,
        requiresConfirmation: event.requiresConfirmation,
        name: event.name,
        args: event.args,
        summary: event.summary,
        cardId: event.cardId,
        error: event.error,
        validation: event.validation
      }

      setMessages((prev) => coalesceTextDelta(prev, message))

      if (message.type === 'plan_progress' && message.cardId != null) {
        const next = new Set(activeCardIdsRef.current)
        if (message.status === 'done') {
          next.delete(message.cardId)
        } else {
          next.add(message.cardId)
        }
        activeCardIdsRef.current = next
        setActiveCardIds(next)
      }

      if (
        message.journeyUpdated === true &&
        subscriptionInput != null
      ) {
        void client.refetchQueries({ include: ['GetAdminJourney'] })
      }

      if (message.type === 'done' || message.type === 'error') {
        setSubscriptionInput(null)
        activeCardIdsRef.current = new Set()
        setActiveCardIds(new Set())
      }
    },
    onError() {
      setSubscriptionInput(null)
      activeCardIdsRef.current = new Set()
      setActiveCardIds(new Set())
    }
  })

  const send = useCallback((input: JourneyAiChatInput) => {
    setMessages([])
    activeCardIdsRef.current = new Set()
    setActiveCardIds(new Set())
    setSubscriptionInput(input)
  }, [])

  const stop = useCallback(() => {
    setSubscriptionInput(null)
    activeCardIdsRef.current = new Set()
    setActiveCardIds(new Set())
  }, [])

  return {
    messages,
    activeCardIds,
    isActive: subscriptionInput != null,
    send,
    stop
  }
}
