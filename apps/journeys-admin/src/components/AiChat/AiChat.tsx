import { useChat } from '@ai-sdk/react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grow from '@mui/material/Grow'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface AiChatProps {
  open?: boolean
}

const INITIAL_SYSTEM_PROMPT = `
You are a helpful assistant that can answer questions and help with tasks.
You are currently in the context of a journey.
`.trim()

export function AiChat({ open = false }: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const user = useUser()
  const { journey } = useJourney()
  const { messages, append, setMessages, status } = useChat({
    fetch: fetchWithAuthorization,
    maxSteps: 5,
    credentials: 'omit'
  })

  const [systemPrompt, setSystemPrompt] = useState(INITIAL_SYSTEM_PROMPT)
  const [userMessage, setUserMessage] = useState('')

  async function fetchWithAuthorization(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `JWT ${await user?.getIdToken()}`
      }
    })
  }

  async function handleSubmit(): Promise<void> {
    const message = userMessage.trim()
    if (message === '') return

    setUserMessage('')
    try {
      if (systemPrompt.trim()) {
        const hasSystemMessage = messages.some((msg) => msg.role === 'system')
        if (!hasSystemMessage) {
          const systemPromptWithJourneyId =
            journey != null
              ? systemPrompt
                  .trim()
                  .concat(`\n\nThe current journey ID is ${journey?.id}`)
              : systemPrompt.trim()
          setMessages([
            {
              id: uuidv4(),
              role: 'system',
              content: systemPromptWithJourneyId
            },
            ...messages
          ])
        } else {
          // Update existing system message
          setMessages(
            messages.map((msg) =>
              msg.role === 'system'
                ? { ...msg, content: systemPrompt.trim() }
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

  return (
    <Grow
      in={open}
      style={{ transformOrigin: 'bottom left' }}
      mountOnEnter
      unmountOnExit
    >
      <Card
        sx={{
          position: 'fixed',
          left: 72,
          bottom: 100,
          borderRadius: 4,
          zIndex: 1200,
          width: 600
        }}
      >
        {/* Chat Messages Display */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 2,
            p: 5,
            pb: 0,
            maxHeight: 'calc(100svh - 400px)',
            minHeight: 150,
            overflowY: 'auto'
          }}
        >
          {nonSystemMessages.length === 0 && (
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
          )}
          {status === 'submitted' && (
            <Box>
              <CircularProgress size={20} />
            </Box>
          )}
          {nonSystemMessages.map((message) => (
            <Box
              key={message.id}
              sx={{
                backgroundColor:
                  message.role === 'user'
                    ? 'action.selected'
                    : 'background.paper',
                py: 2,
                px: message.role === 'user' ? 3 : 0,
                borderRadius: 2,
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap'
                }}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <span key={`${message.id}-${i}`}>{part.text}</span>
                    case 'tool-invocation': {
                      const callId = part.toolInvocation.toolCallId
                      switch (part.toolInvocation.toolName) {
                        case 'getJourney': {
                          switch (part.toolInvocation.state) {
                            case 'call':
                              return (
                                <div key={callId}>
                                  {t('Getting journey...')}
                                </div>
                              )
                            case 'result':
                              return (
                                <div key={callId}>
                                  {t('Journey:')}{' '}
                                  {part.toolInvocation.result.title}
                                </div>
                              )
                          }
                          break
                        }
                        case 'updateJourney': {
                          switch (part.toolInvocation.state) {
                            case 'call':
                              return (
                                <div key={callId}>
                                  {t('Updating journey...')}
                                </div>
                              )
                            case 'result':
                              return (
                                <div key={callId}>
                                  {t('Journey updated:')}{' '}
                                  {part.toolInvocation.result.title}
                                </div>
                              )
                          }
                          break
                        }
                      }
                      return null
                    }
                    default:
                      return null
                  }
                })}
              </Typography>
            </Box>
          ))}
        </Box>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
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
            <Button variant="outlined" onClick={handleSubmit}>
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
              <Typography component="span" variant="body2">
                {t('Advanced Settings')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 4 }}>
              <TextField
                name="systemPrompt"
                label={t('System Prompt')}
                fullWidth
                aria-label={t('System Prompt')}
                placeholder={t('Instructions for the AI')}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                multiline
                maxRows={4}
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Grow>
  )
}
