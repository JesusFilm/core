import { useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import { DefaultChatTransport } from 'ai'
import { useUser } from 'next-firebase-auth'
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Form } from './Form'
import { MessageList } from './MessageList'
import { StateEmpty, StateError, StateLoading } from './State'

interface AiChatProps {
  variant?: 'popup' | 'page'
}

export function AiChat({ variant = 'popup' }: AiChatProps): ReactElement {
  const user = useUser()
  const { journey } = useJourney()
  const traceId = useRef<string | null>(null)
  const sessionId = useRef<string | null>(null)
  const {
    state: { selectedStepId, selectedBlockId }
  } = useEditor()
  const [input, setInput] = useState('')

  useEffect(() => {
    sessionId.current = uuidv4()
  }, [])

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      credentials: 'omit',
      prepareSendMessagesRequest: async (options) => {
        const token = await user?.getIdToken()
        if (!token) throw new Error('Missing auth token')
        return {
          body: {
            ...options.body,
            messages: options.messages,
            journeyId: journey?.id,
            selectedStepId,
            selectedBlockId,
            sessionId: sessionId.current
          },
          headers: {
            ...(options.headers as Record<string, string>),
            Authorization: `JWT ${token}`
          }
        }
      }
    })
  }, [user, journey?.id, selectedStepId, selectedBlockId])

  const { messages, sendMessage, status, setMessages, error, regenerate, stop } =
    useChat({
      transport,
      onFinish: ({ message }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, traceId: traceId.current } : msg
          )
        )
      }
    })

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.()
      const text = input.trim()
      if (!text) return
      setInput('')
      void sendMessage({ text })
    },
    [input, sendMessage]
  )

  return (
    <>
      <Box
        sx={{
          mb: -5,
          height: 20,
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0), #ffffff)',
          position: 'relative'
        }}
      />
      <Box
        data-testid="AiChatContainer"
        sx={{
          display: 'flex',
          flexDirection: 'column-reverse',
          py: 5,
          px: 4,
          maxHeight: variant === 'popup' ? 'calc(100svh - 400px)' : '100%',
          minHeight: 150,
          overflowY: 'auto',
          flexGrow: variant === 'page' ? 1 : 0,
          justifyContent: variant === 'page' ? 'flex-end' : undefined
        }}
      >
        <StateLoading status={status} />
        <StateEmpty
          messages={messages.filter((message) => message.role !== 'system')}
          onSendMessage={(text) => {
            void sendMessage({ text })
          }}
        />
        <StateError
          error={error}
          onRetry={() => {
            void regenerate()
          }}
        />
        <MessageList
          status={status}
          messages={messages}
          addToolResult={() => {}}
        />
      </Box>
      <Box
        sx={{
          mt: -5,
          height: 20,
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff)',
          position: 'relative'
        }}
      />
      <Form
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        error={error}
        status={status}
        stop={stop}
      />
    </>
  )
}
