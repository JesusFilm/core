import { useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grow from '@mui/material/Grow'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'

interface AiChatProps {
  open?: boolean
}

interface FormValues {
  systemPrompt: string
  userMessage: string
}

export function AiChat({ open = false }: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const formikRef = useRef<any>(null)

  const { messages, append, setMessages } = useChat({
    maxSteps: 5
  })

  const initialValues: FormValues = {
    systemPrompt: '',
    userMessage: ''
  }

  function handleFormikSubmit(
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ): void {
    try {
      if (values.systemPrompt.trim()) {
        const hasSystemMessage = messages.some((msg) => msg.role === 'system')
        if (!hasSystemMessage) {
          setMessages([
            {
              id: uuidv4(),
              role: 'system',
              content: values.systemPrompt
            },
            ...messages
          ])
        } else {
          // Update existing system message
          setMessages(
            messages.map((msg) =>
              msg.role === 'system'
                ? { ...msg, content: values.systemPrompt }
                : msg
            )
          )
        }
      }

      // Send the user message if there's content
      if (values.userMessage.trim()) {
        void append({
          role: 'user',
          content: values.userMessage
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      resetForm()
    }
  }

  return (
    <Grow
      in={open}
      mountOnEnter
      unmountOnExit
      style={{ transformOrigin: 'bottom left' }}
    >
      <Card
        sx={{
          position: 'fixed',
          left: 72,
          bottom: 100,
          borderRadius: 4,
          zIndex: 1200,
          width: 400
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
            maxHeight: 500,
            overflowY: 'auto'
          }}
        >
          {messages
            .filter((message) => message.role !== 'system')
            .reverse()
            .map((message) => (
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
                  alignSelf:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
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
                        return (
                          <span key={`${message.id}-${i}`}>{part.text}</span>
                        )
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
        <CardContent>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            onSubmit={handleFormikSubmit}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form>
                <Stack direction="row" spacing={2}>
                  {/* <TextField
                    name="systemPrompt"
                    label={t('System Prompt')}
                    value={values.systemPrompt}
                    fullWidth
                    aria-label={t('System Prompt')}
                    placeholder={t('Instructions for the AI')}
                    onChange={handleChange}
                  /> */}
                  <TextField
                    name="userMessage"
                    value={values.userMessage}
                    onChange={handleChange}
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
                  />
                  <Button type="submit" variant="outlined">
                    <ArrowUpIcon />
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Grow>
  )
}
