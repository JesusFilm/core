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
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface AiChatProps {
  open?: boolean
}

const INITIAL_SYSTEM_PROMPT = `
You are a helpful assistant that can answer questions and help with tasks.
You are currently in the context of a journey.
`

export function AiChat({ open = false }: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { messages, append, setMessages, status } = useChat({
    maxSteps: 5
  })

  const [systemPrompt, setSystemPrompt] = useState(INITIAL_SYSTEM_PROMPT)
  const [userMessage, setUserMessage] = useState('')

  function handleSubmit(): void {
    try {
      if (systemPrompt.trim()) {
        const hasSystemMessage = messages.some((msg) => msg.role === 'system')
        if (!hasSystemMessage) {
          setMessages([
            {
              id: uuidv4(),
              role: 'system',
              content: systemPrompt.trim()
            },
            ...messages
          ])
        } else {
          // Update existing system message
          setMessages(
            messages.map((msg) =>
              msg.role === 'system' ? { ...msg, content: systemPrompt } : msg
            )
          )
        }
      }

      // Send the user message if there's content
      if (userMessage.trim()) {
        void append({
          role: 'user',
          content: userMessage.trim()
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setUserMessage('')
    }
  }

  const nonSystemMessages = messages
    .filter((message) => message.role !== 'system')
    .reverse()

  console.log(nonSystemMessages)

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
                    case 'tool-invocation':
                      return (
                        <pre
                          key={`${message.id}-${i}`}
                          style={{ fontSize: '0.8em', margin: '8px 0' }}
                        >
                          {JSON.stringify(part.toolInvocation, null, 2)}
                        </pre>
                      )
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
                  handleSubmit()
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
                '&.Mui-expanded': {
                  minHeight: 32
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
