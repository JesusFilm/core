import { UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { LanguageModelUsage } from 'ai'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'

import { SystemPrompt } from './SystemPrompt'

interface FormProps {
  usage: LanguageModelUsage | null
  onSubmit: UseChatHelpers['handleSubmit']
  onInputChange: UseChatHelpers['handleInputChange']
  error: UseChatHelpers['error']
  status: UseChatHelpers['status']
  stop: UseChatHelpers['stop']
  input: UseChatHelpers['input']
  systemPrompt: string
  onSystemPromptChange: (systemPrompt: string) => void
}

export function Form({
  input,
  usage,
  onSubmit: handleSubmit,
  onInputChange: handleInputChange,
  error,
  status,
  stop,
  systemPrompt,
  onSystemPromptChange
}: FormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ p: 4, '&:last-child': { pb: 2 } }}>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2}>
          <TextField
            name="userMessage"
            value={input}
            onChange={handleInputChange}
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
            disabled={error != null}
            autoFocus
          />
          {status === 'submitted' || status === 'streaming' ? (
            <Button
              variant="outlined"
              onClick={() => {
                stop()
              }}
              disabled={error != null}
              sx={{
                borderRadius: 1,
                borderWidth: '1px'
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  backgroundColor: 'primary.main',
                  borderRadius: 1
                }}
              />
            </Button>
          ) : (
            <Button
              variant="outlined"
              type="submit"
              disabled={error != null}
              sx={{
                borderRadius: 1,
                borderWidth: '1px'
              }}
            >
              <ArrowUpIcon />
            </Button>
          )}
        </Stack>
      </form>
      <SystemPrompt
        value={systemPrompt}
        onChange={onSystemPromptChange}
        usage={usage}
      />
    </Box>
  )
}
