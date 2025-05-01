import { Message, useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Field, Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface AiChatFormProps {
  className?: string
}

interface FormValues {
  systemPrompt: string
  userMessage: string
}

export function AiChatForm({ className }: AiChatFormProps): ReactElement {
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
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ): void {
    setSubmitting(false)

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
      setSubmitting(false)
    }
  }

  return (
    <Box className={className}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          width: '100%'
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5">{t('AI Chat')}</Typography>
          {/* Chat Messages Display */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              height: 300,
              overflowY: 'auto'
            }}
          >
            {messages
              .filter((message) => message.role !== 'system')
              .map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    backgroundColor:
                      message.role === 'user'
                        ? 'action.selected'
                        : 'background.paper',
                    p: 2,
                    borderRadius: 2,
                    alignSelf:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      color:
                        message.role === 'user'
                          ? 'primary.main'
                          : 'text.primary'
                    }}
                  >
                    {message.role === 'user' ? 'User: ' : 'AI: '}
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

          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            onSubmit={handleFormikSubmit}
          >
            {({ isSubmitting, values, handleChange }) => (
              <Form>
                <Stack direction="row" spacing={2}>
                  <TextField
                    name="systemPrompt"
                    label={t('System Prompt')}
                    value={values.systemPrompt}
                    fullWidth
                    aria-label={t('System Prompt')}
                    placeholder={t('Instructions for the AI')}
                    onChange={handleChange}
                  />
                  <TextField
                    name="userMessage"
                    value={values.userMessage}
                    onChange={handleChange}
                    placeholder={t('Say something...')}
                    fullWidth
                    multiline
                    maxRows={4}
                    aria-label={t('Message')}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    {t('Send')}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Paper>
    </Box>
  )
}
