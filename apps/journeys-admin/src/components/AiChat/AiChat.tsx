import { useChat } from '@ai-sdk/react'
import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import { useUser } from 'next-firebase-auth'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
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
  const client = useApolloClient()
  const { journey } = useJourney()
  const traceId = useRef<string | null>()
  const sessionId = useRef<string | null>()
  const {
    state: { selectedStepId, selectedBlockId }
  } = useEditor()
  const [waitForToolResult, setWaitForToolResult] = useState(false)
  const fetchWithAuthorization = useCallback(
    async (url: string, options: RequestInit): Promise<Response> => {
      const token = await user?.getIdToken()
      if (!token) throw new Error('Missing auth token')

      return await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `JWT ${token}`
        }
      })
    },
    [user]
  )
  useEffect(() => {
    sessionId.current = uuidv4()
  }, [])
  const {
    messages,
    append,
    status,
    addToolResult,
    handleInputChange,
    handleSubmit,
    input,
    stop,
    error,
    reload,
    setMessages
  } = useChat({
    fetch: fetchWithAuthorization,
    maxSteps: 50,
    credentials: 'omit',
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName.startsWith('client')) setWaitForToolResult(true)
    },
    onResponse: (response) => {
      traceId.current = response.headers.get('x-trace-id')
    },
    onFinish: (result) => {
      setMessages((messages) =>
        messages.map((message) => {
          if (message.id == result.id) {
            return {
              ...message,
              traceId: traceId.current
            }
          }
          return message
        })
      )
      const shouldRefetch = result.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation.toolName.endsWith('Update')
      )
      if (shouldRefetch) {
        void client.refetchQueries({
          include: ['GetAdminJourney', 'GetStepBlocksWithPosition']
        })
      }
    },
    experimental_prepareRequestBody: (options) => {
      return {
        ...options,
        journeyId: journey?.id,
        selectedStepId,
        selectedBlockId,
        sessionId: sessionId.current
      }
    }
  })

  function handleAddToolResult(response: Parameters<typeof addToolResult>[0]) {
    setWaitForToolResult(false)
    addToolResult(response)
  }

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
        {/* this component displays it's children in reverse order */}
        <StateLoading status={status} />
        <StateEmpty
          messages={messages.filter((message) => message.role !== 'system')}
          append={append}
        />
        <StateError error={error} reload={reload} />
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
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        error={error}
        status={status}
        stop={stop}
        waitForToolResult={waitForToolResult}
      />
    </>
  )
}
