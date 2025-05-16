import { useChat } from '@ai-sdk/react'
import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import { LanguageModelUsage } from 'ai'
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
    state: { selectedStepId }
  } = useEditor()
  const [usage, setUsage] = useState<LanguageModelUsage | null>(null)
  const [systemPrompt, setSystemPrompt] = useState<string>('')
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
        content: getSystemPromptWithContext()
      }
    ],
    fetch: fetchWithAuthorization,
    maxSteps: 50,
    credentials: 'omit',
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
    }
  })

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

  function getSystemPromptWithContext(): string {
    let systemPromptWithContext = systemPrompt

    if (journey == null) return systemPromptWithContext

    systemPromptWithContext = `${systemPromptWithContext}\n\nThe current journey ID is ${journey?.id}. You can use this to get the journey and update it. RUN THE GET JOURNEY TOOL FIRST IF YOU DO NOT HAVE THE JOURNEY ALREADY. \n\n ${JSON.stringify(journey)}`

    if (selectedStepId != null)
      systemPromptWithContext = `${systemPromptWithContext}\n\nThe current step ID is ${selectedStepId}. You can use this to get the step and update it.`

    if (systemPromptFooter != null)
      systemPromptWithContext = `${systemPromptWithContext}\n\n${systemPromptFooter}`

    return systemPromptWithContext
  }

  function handleSystemPromptChange(systemPrompt: string): void {
    setSystemPrompt(systemPrompt)
    setMessages(
      messages.map((message) =>
        message.role === 'system'
          ? { ...message, content: getSystemPromptWithContext() }
          : message
      )
    )
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
          append={append}
        />
        <StateError error={error} reload={reload} />
        <MessageList messages={messages} addToolResult={addToolResult} />
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
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        error={error}
        status={status}
        stop={stop}
        systemPrompt={systemPrompt}
        onSystemPromptChange={handleSystemPromptChange}
      />
    </>
  )
}
