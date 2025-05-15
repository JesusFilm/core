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
    <Box sx={{ p: 4, pt: 0, '&:last-child': { pb: 2 } }}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
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
            sx={{
              '& .MuiOutlinedInput-root': {
                pb: 0,
                '& fieldset': {
                  border: 'none'
                }
              }
            }}
          />
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            sx={{ px: 2, pb: 2 }}
          >
            <Box />
            <Box>
              {status === 'submitted' || status === 'streaming' ? (
                <Button
                  onClick={() => stop()}
                  disabled={error != null}
                  variant="contained"
                  size="small"
                  sx={{
                    minWidth: 32,
                    width: 32,
                    height: 32,
                    borderRadius: '100%',
                    p: 0
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      backgroundColor: 'white',
                      borderRadius: 1
                    }}
                  />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={error != null}
                  variant="contained"
                  size="small"
                  sx={{
                    minWidth: 32,
                    width: 32,
                    height: 32,
                    borderRadius: '100%',
                    p: 0
                  }}
                >
                  <ArrowUpIcon />
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      </form>
      <SystemPrompt
        value={systemPrompt}
        onChange={onSystemPromptChange}
        usage={usage}
      />
    </Box>
  )
}
