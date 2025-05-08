import { useChat } from '@ai-sdk/react'
import { useApolloClient } from '@apollo/client'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LanguageModelUsage } from 'ai'
import noop from 'lodash/noop'
import Image from 'next/image'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { ImageLibrary } from '../Editor/Slider/Settings/Drawer/ImageLibrary'
import { VideoLibrary } from '../Editor/Slider/Settings/Drawer/VideoLibrary'

import { SystemPrompt } from './SystemPrompt'

interface AiChatProps {
  open?: boolean
}

export function AiChat({ open = false }: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const user = useUser()
  const client = useApolloClient()
  const { journey } = useJourney()
  const {
    state: { selectedStepId }
  } = useEditor()
  const [usage, setUsage] = useState<LanguageModelUsage | null>(null)
  const { messages, append, setMessages, status, addToolResult } = useChat({
    fetch: fetchWithAuthorization,
    maxSteps: 5,
    credentials: 'omit',
    onFinish: (result, { usage }) => {
      setUsage(usage)
      console.log('result', result)
      const shouldRefetch = result.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          [
            'journeyUpdateMany',
            'blockCardUpdateMany',
            'blockTypographyCreate',
            'blockTypographyUpdateMany',
            'blockRadioOptionUpdateMany',
            'blockButtonUpdateMany',
            'blockImageUpdateMany',
            'blockVideoUpdateMany'
          ].includes(part.toolInvocation.toolName)
      )
      if (shouldRefetch) {
        void client.refetchQueries({
          include: ['GetAdminJourney']
        })
      }
    }
  })
  const [userMessage, setUserMessage] = useState('')
  const [openImageLibrary, setOpenImageLibrary] = useState<boolean | null>(null)
  const [openVideoLibrary, setOpenVideoLibrary] = useState<boolean | null>(null)
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [clientSideToolCall, setClientSideToolCall] = useState<{
    id: string
    callback?: () => void
  } | null>(null)

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

    return systemPromptWithContext
  }

  function handleToolCall(toolCallId: string, result: string): void {
    addToolResult({
      toolCallId: toolCallId,
      result: result
    })
    clientSideToolCall?.callback?.()
    setClientSideToolCall(null)
  }

  async function handleSubmit(customMessage?: string): Promise<void> {
    const message = customMessage ?? userMessage.trim()

    if (message === '') return
    if (clientSideToolCall != null) {
      handleToolCall(clientSideToolCall.id, 'cancel the previous tool call')
    }

    setUserMessage('')
    try {
      const systemPromptWithContext = getSystemPromptWithContext()
      if (systemPromptWithContext) {
        const hasSystemMessage = messages.some((msg) => msg.role === 'system')
        if (!hasSystemMessage) {
          setMessages([
            {
              id: uuidv4(),
              role: 'system',
              content: systemPromptWithContext
            },
            ...messages
          ])
        } else {
          // Update existing system message
          setMessages(
            messages.map((msg) =>
              msg.role === 'system'
                ? { ...msg, content: systemPromptWithContext }
                : msg
            )
          )
        }
      }
      // Send the user message if there's content
      if (message) {
        await append({
          role: 'user',
          content: message
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const nonSystemMessages = messages
    .filter((message) => message.role !== 'system')
    .reverse()

  // Effect to handle client tool invocations only once per toolCallId
  useEffect(() => {
    // Find the latest unhandled client-side tool invocation
    const unhandled = nonSystemMessages
      .flatMap((msg) => msg.parts)
      .find((part) => {
        if (
          part.type === 'tool-invocation' &&
          (part.toolInvocation.toolName === 'clientSelectImage' ||
            part.toolInvocation.toolName === 'clientSelectVideo') &&
          part.toolInvocation.state === 'call'
        ) {
          return true
        }
        return false
      })
    if (
      unhandled &&
      unhandled.type === 'tool-invocation' &&
      (unhandled.toolInvocation.toolName === 'clientSelectImage' ||
        unhandled.toolInvocation.toolName === 'clientSelectVideo') &&
      unhandled.toolInvocation.state === 'call' &&
      (!clientSideToolCall ||
        clientSideToolCall.id !== unhandled.toolInvocation.toolCallId)
    ) {
      setClientSideToolCall({
        id: unhandled.toolInvocation.toolCallId,
        callback: noop
      })
    }
  }, [nonSystemMessages, clientSideToolCall])

  return (
    <>
      {/* Chat Messages Display */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 4,
          p: 5,
          pb: 0,
          maxHeight: 'calc(100svh - 400px)',
          minHeight: 150,
          overflowY: 'auto'
        }}
      >
        {nonSystemMessages.length === 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Chip
                label={t('Customize my journey')}
                size="small"
                variant="outlined"
                onClick={() => {
                  void handleSubmit('Help me customize my journey.')
                }}
              />
              <Chip
                label={t('Translate to another language')}
                size="small"
                variant="outlined"
                onClick={() => {
                  void handleSubmit(
                    'Help me to translate my journey to another language.'
                  )
                }}
              />
              <Chip
                label={t('Tell me about my journey')}
                size="small"
                variant="outlined"
                onClick={() => {
                  void handleSubmit('Tell me about my journey.')
                }}
              />
              <Chip
                label={t('What can I do to improve my journey?')}
                size="small"
                variant="outlined"
                onClick={() => {
                  void handleSubmit('What can I do to improve my journey?')
                }}
              />
            </Box>

            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{
                my: 4,
                mx: 3,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {t(
                'NextSteps AI can help you make your journey more effective! Ask it anything.'
              )}
            </Typography>
          </>
        )}
        {status === 'submitted' && (
          <Box>
            <CircularProgress size={18} />
          </Box>
        )}
        {nonSystemMessages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor:
                message.role === 'user'
                  ? 'action.selected'
                  : 'background.paper',
              py: message.role === 'user' ? 2 : 0,
              px: message.role === 'user' ? 3 : 0,
              borderRadius: 2,
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              '& > p': {
                m: 0
              }
            }}
          >
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text': {
                  return message.role === 'user' ? (
                    <Typography key={`${message.id}-${i}`}>
                      {part.text}
                    </Typography>
                  ) : (
                    <Markdown key={`${message.id}-${i}`}>{part.text}</Markdown>
                  )
                }
                case 'tool-invocation': {
                  const callId = part.toolInvocation.toolCallId
                  switch (part.toolInvocation.toolName) {
                    case 'agentWebSearch': {
                      switch (part.toolInvocation.state) {
                        case 'call':
                          return (
                            <Typography
                              key={callId}
                              variant="body2"
                              color="text.secondary"
                            >
                              {t('Searching the web...')}
                            </Typography>
                          )
                        default:
                          return null
                      }
                    }
                    case 'journeyGet': {
                      switch (part.toolInvocation.state) {
                        case 'call':
                          return (
                            <Typography
                              key={callId}
                              variant="body2"
                              color="text.secondary"
                            >
                              {t('Getting journey...')}
                            </Typography>
                          )
                        default: {
                          return (
                            <Box>
                              <Chip
                                key={callId}
                                label={t('Journey retrieved')}
                                size="small"
                              />
                            </Box>
                          )
                        }
                      }
                    }
                    case 'journeyUpdateMany': {
                      switch (part.toolInvocation.state) {
                        case 'call':
                          return (
                            <Typography
                              key={callId}
                              variant="body2"
                              color="text.secondary"
                            >
                              {t('Updating journey...')}
                            </Typography>
                          )
                        case 'result':
                          return (
                            <Box>
                              <Chip
                                key={callId}
                                label={t('Journey updated')}
                                size="small"
                              />
                            </Box>
                          )
                        default: {
                          return null
                        }
                      }
                    }
                    case 'blockTypographyCreate': {
                      switch (part.toolInvocation.state) {
                        case 'result': {
                          return (
                            <Box>
                              <Chip
                                key={callId}
                                label={t('Typography block created')}
                              />
                            </Box>
                          )
                        }
                        default: {
                          return null
                        }
                      }
                    }
                    case 'clientSelectImage': {
                      switch (part.toolInvocation.state) {
                        case 'call': {
                          return (
                            <Box key={callId}>
                              <Typography
                                key={callId}
                                variant="body2"
                                color="text.secondary"
                              >
                                {part.toolInvocation.args.message}
                              </Typography>

                              <Box>
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    setClientSideToolCall({
                                      id: callId,
                                      callback: () => {
                                        setOpenImageLibrary(false)
                                      }
                                    })
                                    setOpenImageLibrary(true)
                                  }}
                                >
                                  {t('Open Image Library')}
                                </Button>
                              </Box>
                            </Box>
                          )
                        }
                        default: {
                          return null
                        }
                      }
                    }
                    case 'clientSelectVideo': {
                      switch (part.toolInvocation.state) {
                        case 'call': {
                          return (
                            <Box key={callId}>
                              <Typography
                                key={callId}
                                variant="body2"
                                color="text.secondary"
                              >
                                {part.toolInvocation.args.message}
                              </Typography>

                              <Box>
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    setClientSideToolCall({
                                      id: callId,
                                      callback: () => {
                                        setOpenVideoLibrary(false)
                                      }
                                    })
                                    setOpenVideoLibrary(true)
                                  }}
                                >
                                  {t('Open Video Library')}
                                </Button>
                              </Box>
                            </Box>
                          )
                        }
                        default: {
                          return null
                        }
                      }
                    }
                    case 'generateImage': {
                      switch (part.toolInvocation.state) {
                        case 'call':
                          return (
                            <Typography
                              key={callId}
                              variant="body2"
                              color="text.secondary"
                            >
                              {t('Generating image...')}
                            </Typography>
                          )
                        case 'result':
                          return (
                            <Stack gap={2}>
                              <Chip
                                key={callId}
                                label={t('Image generated')}
                                size="small"
                              />
                              <Image
                                src={part.toolInvocation.result.imageSrc}
                                alt="Generated image"
                                width={100}
                                height={100}
                              />
                            </Stack>
                          )
                        default: {
                          return null
                        }
                      }
                    }
                    default: {
                      return null
                    }
                  }
                }
              }
            })}
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 4, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={2}>
          <TextField
            name="userMessage"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder={t('Ask Anything')}
            fullWidth
            multiline
            maxRows={4}
            aria-label={t('Message')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSubmit()
              }
            }}
            autoFocus
          />
          <Button
            variant="outlined"
            onClick={() => {
              void handleSubmit()
            }}
            sx={{
              borderRadius: 1,
              borderWidth: '1px'
            }}
          >
            <ArrowUpIcon />
          </Button>
        </Stack>
        <Accordion
          sx={{
            mt: 2,
            '&:before': {
              display: 'none'
            }
          }}
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon fontSize="small" />}
            sx={{
              minHeight: 32,
              p: 0,
              '&.Mui-expanded': {
                minHeight: 32,
                p: 0
              },
              '& > .MuiAccordionSummary-content': {
                my: 0,
                justifyContent: 'flex-end',
                mr: 1,
                '&.Mui-expanded': {
                  my: 0,
                  mr: 1
                }
              }
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ width: '100%', justifyContent: 'space-between' }}
            >
              <Typography component="span" variant="body2">
                {usage?.totalTokens ?? 0} {t('Tokens Used')}
              </Typography>
              <Typography component="span" variant="body2">
                {t('Advanced Settings')}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pb: 4 }}>
            <SystemPrompt value={systemPrompt} onChange={setSystemPrompt} />
          </AccordionDetails>
        </Accordion>
      </Box>
      <ImageLibrary
        open={openImageLibrary ?? false}
        onClose={() => {
          if (clientSideToolCall != null) {
            handleToolCall(
              clientSideToolCall.id,
              'cancel the previous tool call'
            )
          }
          setOpenImageLibrary(false)
        }}
        onChange={async (selectedImage) => {
          if (clientSideToolCall != null) {
            handleToolCall(
              clientSideToolCall.id,
              `here is the image the new image. Update the old image block to this image: ${JSON.stringify(
                selectedImage
              )}`
            )
          }
        }}
        selectedBlock={null}
      />
      <VideoLibrary
        open={openVideoLibrary ?? false}
        onClose={() => {
          if (clientSideToolCall != null) {
            handleToolCall(
              clientSideToolCall.id,
              'cancel the previous tool call'
            )
          }
          setOpenVideoLibrary(false)
        }}
        selectedBlock={null}
        onSelect={async (selectedVideo) => {
          if (clientSideToolCall != null) {
            handleToolCall(
              clientSideToolCall.id,
              `here is the video: ${JSON.stringify(selectedVideo)}`
            )
          }
        }}
      />
    </>
  )
}
