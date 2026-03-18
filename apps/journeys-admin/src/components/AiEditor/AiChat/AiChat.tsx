import { gql, useMutation } from '@apollo/client'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useReducer, useRef } from 'react'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import {
  JourneyAiEdit,
  JourneyAiEditVariables
} from '../../../../__generated__/JourneyAiEdit'
import {
  JourneySimpleUpdateFromAiEditor,
  JourneySimpleUpdateFromAiEditorVariables
} from '../../../../__generated__/JourneySimpleUpdateFromAiEditor'

import { AiChatInput } from './AiChatInput'
import { AiChatMessage, ChatMessage } from './AiChatMessage'

export const JOURNEY_AI_EDIT = gql`
  mutation JourneyAiEdit($input: JourneyAiEditInput!) {
    journeyAiEdit(input: $input) {
      reply
      proposedJourney
    }
  }
`

export const JOURNEY_SIMPLE_UPDATE = gql`
  mutation JourneySimpleUpdateFromAiEditor($id: ID!, $journey: Json!) {
    journeySimpleUpdate(id: $id, journey: $journey)
  }
`

export interface AiState {
  status: 'idle' | 'loading' | 'proposal' | 'error'
  affectedCardIds: string[]
}

interface AiChatProps {
  journeyId: string
  currentJourney: JourneySimple | null
  selectedCardId?: string | null
  selectedCardIndex?: number | null
  onClearSelectedCard?: () => void
  onAiState: (state: AiState) => void
  onProposedJourney: (journey: JourneySimple | null) => void
  onJourneyUpdated: (journey: JourneySimple) => void
  sx?: SxProps
}

interface AiChatState {
  status: 'idle' | 'loading' | 'error'
  messages: ChatMessage[]
  generationId: number
  inputValue: string
  errorMessage: string | null
  applyingMessageId: number | null
}

type AiChatAction =
  | { type: 'SEND'; message: string }
  | {
      type: 'RECEIVE'
      reply: string
      proposedJourney: JourneySimple | null
      diffSummary: string[]
    }
  | { type: 'ERROR'; errorMessage: string }
  | { type: 'INPUT_CHANGE'; value: string }
  | { type: 'APPLY_START'; messageGenerationId: number }
  | { type: 'APPLY_SUCCESS'; messageGenerationId: number }
  | { type: 'APPLY_ERROR'; messageGenerationId: number }
  | { type: 'DISMISS'; messageGenerationId: number }

function reducer(state: AiChatState, action: AiChatAction): AiChatState {
  switch (action.type) {
    case 'SEND': {
      const userMessage: ChatMessage = {
        role: 'user',
        content: action.message,
        generationId: state.generationId + 1
      }
      return {
        ...state,
        status: 'loading',
        messages: [...state.messages, userMessage],
        generationId: state.generationId + 1,
        inputValue: '',
        errorMessage: null
      }
    }
    case 'RECEIVE': {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: action.reply,
        proposedJourney: action.proposedJourney ?? undefined,
        diffSummary: action.diffSummary,
        generationId: state.generationId
      }
      return {
        ...state,
        status: 'idle',
        messages: [...state.messages, assistantMessage]
      }
    }
    case 'ERROR': {
      return {
        ...state,
        status: 'idle',
        errorMessage: action.errorMessage
      }
    }
    case 'INPUT_CHANGE': {
      return { ...state, inputValue: action.value }
    }
    case 'APPLY_START': {
      return { ...state, applyingMessageId: action.messageGenerationId }
    }
    case 'APPLY_SUCCESS': {
      return {
        ...state,
        applyingMessageId: null,
        generationId: state.generationId + 1,
        messages: state.messages.map((m) =>
          m.generationId === action.messageGenerationId
            ? { ...m, applied: true }
            : m
        )
      }
    }
    case 'APPLY_ERROR': {
      return { ...state, applyingMessageId: null }
    }
    case 'DISMISS': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.generationId === action.messageGenerationId
            ? { ...m, dismissed: true }
            : m
        )
      }
    }
    default:
      return state
  }
}

function describeJourneyDiff(
  current: JourneySimple | null,
  proposed: JourneySimple
): { affectedCardIds: string[]; summary: string[] } {
  if (current == null) {
    return {
      affectedCardIds: proposed.cards.map((c) => c.id),
      summary: ['Journey updated']
    }
  }

  const affectedCardIds: string[] = []
  const summary: string[] = []

  const currentMap = new Map(current.cards.map((c) => [c.id, c]))
  const proposedMap = new Map(proposed.cards.map((c) => [c.id, c]))

  for (const proposedCard of proposed.cards) {
    const currentCard = currentMap.get(proposedCard.id)
    if (currentCard == null) {
      affectedCardIds.push(proposedCard.id)
      const idx = proposed.cards.indexOf(proposedCard) + 1
      summary.push(`New screen added at position ${idx}`)
    } else if (JSON.stringify(currentCard) !== JSON.stringify(proposedCard)) {
      affectedCardIds.push(proposedCard.id)
      const idx = proposed.cards.indexOf(proposedCard) + 1
      summary.push(`Screen ${idx} updated`)
    }
  }

  for (const currentCard of current.cards) {
    if (!proposedMap.has(currentCard.id)) {
      const idx = current.cards.indexOf(currentCard) + 1
      summary.push(`Screen ${idx} removed`)
    }
  }

  if (current.title !== proposed.title) {
    summary.push(`Title updated to "${proposed.title}"`)
  }

  return { affectedCardIds, summary }
}

const SUGGESTED_PROMPTS = [
  'Add an introduction screen at the beginning',
  'Make the call-to-action more compelling',
  'What could I improve about this journey?'
]

export function AiChat({
  journeyId,
  currentJourney,
  selectedCardId,
  selectedCardIndex,
  onClearSelectedCard,
  onAiState,
  onProposedJourney,
  onJourneyUpdated,
  sx
}: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [state, dispatch] = useReducer(reducer, {
    status: 'idle',
    messages: [],
    generationId: 0,
    inputValue: '',
    errorMessage: null,
    applyingMessageId: null
  })

  const [journeyAiEdit] = useMutation<JourneyAiEdit, JourneyAiEditVariables>(
    JOURNEY_AI_EDIT
  )
  const [journeySimpleUpdate] = useMutation<
    JourneySimpleUpdateFromAiEditor,
    JourneySimpleUpdateFromAiEditorVariables
  >(JOURNEY_SIMPLE_UPDATE)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  const handleSend = useCallback(async () => {
    if (state.status !== 'idle' || state.inputValue.trim().length === 0) return

    const message = state.inputValue.trim()
    dispatch({ type: 'SEND', message })

    const history = state.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content
    }))

    onAiState({
      status: 'loading',
      affectedCardIds: selectedCardId != null ? [selectedCardId] : []
    })

    try {
      const result = await journeyAiEdit({
        variables: {
          input: {
            journeyId,
            message,
            history,
            selectedCardId: selectedCardId ?? null
          }
        }
      })

      const data = result.data?.journeyAiEdit
      if (data == null) throw new Error('No response from AI')

      const proposedJourney = data.proposedJourney as JourneySimple | null
      const diff =
        proposedJourney != null
          ? describeJourneyDiff(currentJourney, proposedJourney)
          : { affectedCardIds: [], summary: [] }

      dispatch({
        type: 'RECEIVE',
        reply: data.reply ?? '',
        proposedJourney,
        diffSummary: diff.summary
      })

      onProposedJourney(proposedJourney)
      onAiState({
        status: proposedJourney != null ? 'proposal' : 'idle',
        affectedCardIds: diff.affectedCardIds
      })
    } catch {
      dispatch({
        type: 'ERROR',
        errorMessage: 'Failed to get a response. Please try again.'
      })
      onAiState({ status: 'idle', affectedCardIds: [] })
    }
  }, [
    state.status,
    state.inputValue,
    state.messages,
    journeyId,
    selectedCardId,
    currentJourney,
    journeyAiEdit,
    onProposedJourney,
    onAiState
  ])

  const handleApply = useCallback(
    async (message: ChatMessage) => {
      if (message.proposedJourney == null) return
      if (message.generationId !== state.generationId) return

      dispatch({ type: 'APPLY_START', messageGenerationId: message.generationId })

      try {
        await journeySimpleUpdate({
          variables: {
            id: journeyId,
            journey: message.proposedJourney
          }
        })
        dispatch({
          type: 'APPLY_SUCCESS',
          messageGenerationId: message.generationId
        })
        onProposedJourney(null)
        onJourneyUpdated(message.proposedJourney)
        onAiState({ status: 'idle', affectedCardIds: [] })
      } catch {
        dispatch({
          type: 'APPLY_ERROR',
          messageGenerationId: message.generationId
        })
      }
    },
    [
      state.generationId,
      journeyId,
      journeySimpleUpdate,
      onProposedJourney,
      onJourneyUpdated,
      onAiState
    ]
  )

  const handleDismiss = useCallback(
    (message: ChatMessage) => {
      dispatch({ type: 'DISMISS', messageGenerationId: message.generationId })
      onProposedJourney(null)
      onAiState({ status: 'idle', affectedCardIds: [] })
    },
    [onProposedJourney, onAiState]
  )

  const isEmpty = state.messages.length === 0

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        ...sx
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6">{t('AI Editor')}</Typography>
      </Box>

      {/* Messages area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isEmpty ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('Describe changes to your journey in plain language')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Typography
                  key={prompt}
                  variant="caption"
                  component="div"
                  onClick={() =>
                    dispatch({ type: 'INPUT_CHANGE', value: prompt })
                  }
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {prompt}
                </Typography>
              ))}
            </Box>
          </Box>
        ) : (
          state.messages.map((message, i) => (
            <AiChatMessage
              key={i}
              message={message}
              currentGenerationId={state.generationId}
              onApply={handleApply}
              onDismiss={handleDismiss}
              applying={state.applyingMessageId === message.generationId}
            />
          ))
        )}
        {state.status === 'loading' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary'
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="caption">{t('Thinking...')}</Typography>
            </Box>
          </Box>
        )}
        {state.errorMessage != null && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mb: 2 }}
          >
            {state.errorMessage}
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <AiChatInput
        value={state.inputValue}
        onChange={(value) => dispatch({ type: 'INPUT_CHANGE', value })}
        onSend={handleSend}
        disabled={state.status === 'loading'}
        selectedCardId={selectedCardId}
        selectedCardIndex={selectedCardIndex}
        onClearSelectedCard={onClearSelectedCard}
      />
    </Box>
  )
}
