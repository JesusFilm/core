import { useChat } from '@ai-sdk/react'
import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import { useUser } from 'next-firebase-auth'
import { DefaultChatTransport, UIMessage } from 'ai'
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Form } from './Form'
import { MessageList } from './MessageList'
import { StateEmpty, StateError, StateLoading } from './State'

/** Convert UIMessage[] to legacy { role, content }[] for the current API route. */
function toLegacyMessages(messages: UIMessage[]): { role: string; content: string }[] {
  return messages.map((msg) => {
    const content =
      msg.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? ''
    return { role: msg.role, content }
  })
}

interface AiChatProps {
  variant?: 'popup' | 'page'
}

export function AiChat({ variant = 'popup' }: AiChatProps): ReactElement {
  const user = useUser()
  const client = useApolloClient()
  const { journey } = useJourney()
  const traceId = useRef<string | null>(null)
  const sessionId = useRef<string | null>(null)
  const {
    state: { selectedStepId, selectedBlockId }
  } = useEditor()
  const [waitForToolResult, setWaitForToolResult] = useState(false)
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
        const legacyMessages = toLegacyMessages(options.messages)
        return {
          body: {
            ...options.body,
            messages: legacyMessages,
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

  const {
    messages,
    sendMessage,
    status,
    addToolResult: addToolResultV5,
    setMessages,
    error,
    regenerate,
    stop
  } = useChat({
    transport,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName.startsWith('client')) setWaitForToolResult(true)
    },
    onFinish: ({ message, messages: currentMessages }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === message.id) {
            return { ...msg, traceId: traceId.current }
          }
          return msg
        })
      )
      const shouldRefetch = message.parts?.some(
        (part: { type: string; toolInvocation?: { toolName: string } }) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.toolName.endsWith('Update')
      )
      if (shouldRefetch) {
        void client.refetchQueries({
          include: ['GetAdminJourney', 'GetStepBlocksWithPosition']
        })
      }
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

  const handleAddToolResult = useCallback(
    ({
      tool,
      toolCallId,
      result
    }: {
      tool: string
      toolCallId: string
      result: unknown
    }) => {
      setWaitForToolResult(false)
      void addToolResultV5({
        tool: tool as Parameters<typeof addToolResultV5>[0]['tool'],
        toolCallId,
        output: result
      })
    },
    [addToolResultV5]
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
          onSendMessage={(text) => void sendMessage({ text })}
        />
        <StateError error={error} onRetry={() => void regenerate()} />
        <MessageList
          status={status}
          messages={messages}
          addToolResult={handleAddToolResult}
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
        waitForToolResult={waitForToolResult}
      />
    </>
  )
}
