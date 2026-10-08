import { useApolloClient } from '@apollo/client/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  type AiBuilderDraft,
  type AiBuilderEvent,
  applyEvent,
  buildRunInput,
  emptyOutcome,
  finishRun
} from './aiBuilderDraft'

export const JOURNEY_AI_BUILDER_SUBSCRIPTION = graphql(`
  subscription JourneyAiBuilderSubscription($input: JourneyAiBuilderInput!) {
    journeyAiBuilderSubscription(input: $input) {
      type
      stage
      status
      text
      kind
      payload
    }
  }
`)

const STAGE_LABEL: Record<string, string> = {
  guide: 'Reading your message',
  planner: 'Planning',
  builder: 'Building the journey',
  repair: 'Fixing problems',
  images: 'Finding images'
}

interface UseAiBuilderRun {
  running: boolean
  /** What the run is doing now, e.g. "Building the journey (1200 characters)". */
  status: string | null
  /** Runs the draft's latest user message. */
  start: (draft: AiBuilderDraft) => void
  stop: () => void
}

/**
 * Runs one chat message through `journeyAiBuilderSubscription` and applies its
 * events to the draft as they arrive. One run at a time; stop unsubscribes,
 * which makes the server abort the model call.
 */
export function useAiBuilderRun(
  updateDraft: (
    id: string,
    update: (draft: AiBuilderDraft) => AiBuilderDraft
  ) => void
): UseAiBuilderRun {
  const client = useApolloClient()
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => () => subscriptionRef.current?.unsubscribe(), [])

  const start = useCallback(
    (draft: AiBuilderDraft) => {
      const { input, summarisedUpTo } = buildRunInput(draft)
      const outcome = emptyOutcome()
      setRunning(true)
      setStatus(STAGE_LABEL.guide)

      function finish(): void {
        subscriptionRef.current = null
        updateDraft(draft.id, (current) => finishRun(current, outcome))
        setRunning(false)
        setStatus(null)
      }

      function apply(event: AiBuilderEvent): void {
        if (event.type === 'progress') {
          const label = STAGE_LABEL[event.stage] ?? event.stage
          setStatus(
            event.status === 'streaming' && event.text != null
              ? `${label} (${event.text})`
              : label
          )
          return
        }
        updateDraft(draft.id, (current) =>
          applyEvent(current, event, outcome, summarisedUpTo)
        )
      }

      subscriptionRef.current = client
        .subscribe({
          query: JOURNEY_AI_BUILDER_SUBSCRIPTION,
          variables: { input }
        })
        .subscribe({
          next: (result) => {
            const event = result.data?.journeyAiBuilderSubscription
            if (event == null) return
            apply(toEvent(event))
          },
          error: (error: unknown) => {
            apply({
              type: 'error',
              text:
                error instanceof Error && error.message !== ''
                  ? `Sorry, the builder failed: ${error.message}`
                  : 'Sorry, the builder failed.'
            })
            finish()
          },
          complete: finish
        })
    },
    [client, updateDraft]
  )

  const stop = useCallback(() => {
    if (subscriptionRef.current == null) return
    subscriptionRef.current.unsubscribe()
    subscriptionRef.current = null
    setRunning(false)
    setStatus(null)
  }, [])

  return { running, status, start, stop }
}

function toEvent(event: {
  type: string
  stage: string | null
  status: string | null
  text: string | null
  kind: string | null
  payload: unknown
}): AiBuilderEvent {
  switch (event.type) {
    case 'progress':
      return {
        type: 'progress',
        stage: event.stage ?? '',
        status: event.status ?? '',
        text: event.text
      }
    case 'message':
    case 'summary':
    case 'error':
      return { type: event.type, text: event.text ?? '' }
    case 'content':
      return { type: 'content', kind: event.kind ?? '', payload: event.payload }
    default:
      return { type: 'done' }
  }
}
