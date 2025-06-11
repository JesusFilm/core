import { useChat } from '@ai-sdk/react'
import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  ChatRequestOptions,
  CreateMessage,
  LanguageModelUsage,
  Message
} from 'ai'
import { useUser } from 'next-firebase-auth'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Form } from './Form'
import { MessageList } from './MessageList'
import { StateEmpty, StateError, StateLoading } from './State'

interface AiChatProps {
  variant?: 'popup' | 'page'
  systemPromptFooter?: string
}

export function AiChat({
  variant = 'popup',
  systemPromptFooter
}: AiChatProps): ReactElement {
  const user = useUser()
  const client = useApolloClient()
  const { journey } = useJourney()
  const {
    state: { selectedStepId, selectedBlockId }
  } = useEditor()
  const [usage, setUsage] = useState<LanguageModelUsage | null>(null)
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [waitForToolResult, setWaitForToolResult] = useState(false)

  const {
    messages,
    setMessages,
    append,
    status,
    addToolResult,
    handleInputChange,
    handleSubmit,
    input,
    stop,
    error,
    reload
  } = useChat({
    initialMessages: [
      {
        id: uuidv4(),
        role: 'system',
        content: ''
      }
    ],
    fetch: fetchWithAuthorization,
    maxSteps: 50,
    credentials: 'omit',
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName.startsWith('client')) setWaitForToolResult(true)
    },
    onFinish: (result, { usage }) => {
      setUsage(usage)
      const shouldRefetch = result.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          (part.toolInvocation.toolName.endsWith('Update') ||
            part.toolInvocation.toolName.endsWith('Create'))
      )
      if (shouldRefetch) {
        void client.refetchQueries({
          include: ['GetAdminJourney', 'GetStepBlocksWithPosition']
        })
      }
    },
    onError: (error) => {
      console.error('useChat error', error)
    },
    experimental_prepareRequestBody: (options) => {
      return {
        ...options,
        journeyId: journey?.id,
        selectedStepId,
        selectedBlockId
      }
    }
  })

  function handleAddToolResult(response: Parameters<typeof addToolResult>[0]) {
    setWaitForToolResult(false)
    addToolResult(response)
  }

  async function fetchWithAuthorization(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const token = await user?.getIdToken()

    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `JWT ${token}`
      }
    })
  }

  function updateSystemPromptMessage(): void {
    let content = systemPrompt

    if (journey != null)
      content = `${content}\n\nThe current journey ID is ${journey?.id}. You can use this to get the journey and update it. RUN THE GET JOURNEY TOOL FIRST IF YOU DO NOT HAVE THE JOURNEY ALREADY. \n\n ${JSON.stringify(journey)}`

    if (selectedStepId != null)
      content = `${content}\n\nThe current step ID is ${selectedStepId}. You can use this to get the step and update it.`

    if (systemPromptFooter != null)
      content = `${content}\n\n${systemPromptFooter}`

    const [systemMessage, ...rest] = messages
    setMessages([{ ...systemMessage, content }, ...rest])
  }

  function handleSubmitBeforeUseChat(
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ): void {
    updateSystemPromptMessage()
    handleSubmit(event, chatRequestOptions)
  }

  function handleAppendBeforeUseChat(
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ): Promise<string | null | undefined> {
    updateSystemPromptMessage()
    return append(message, chatRequestOptions)
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
          append={handleAppendBeforeUseChat}
        />
        <StateError error={error} reload={reload} />
        <MessageList messages={messages} addToolResult={handleAddToolResult} />
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
        usage={usage}
        onSubmit={handleSubmitBeforeUseChat}
        onInputChange={handleInputChange}
        error={error}
        status={status}
        stop={stop}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        waitForToolResult={waitForToolResult}
      />
    </>
  )
}
