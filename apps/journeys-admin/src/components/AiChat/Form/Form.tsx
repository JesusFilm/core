import { UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ArrowUpIcon from '@core/shared/ui/icons/ArrowUp'

interface FormProps {
  onSubmit: UseChatHelpers['handleSubmit']
  onInputChange: UseChatHelpers['handleInputChange']
  error: UseChatHelpers['error']
  status: UseChatHelpers['status']
  stop: UseChatHelpers['stop']
  input: UseChatHelpers['input']
  waitForToolResult?: boolean
}

export function Form({
  input,
  onSubmit: handleSubmit,
  onInputChange: handleInputChange,
  error,
  status,
  stop,
  waitForToolResult
}: FormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const isInputEmpty = (value: string): boolean => {
    return value.trim().length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isInputEmpty(input)) {
      return
    }
    handleSubmit(e)
  }

  return (
    <Box sx={{ p: 4, pt: 0, '&:last-child': { pb: 6 } }}>
      <form onSubmit={handleFormSubmit}>
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
                if (!isInputEmpty(input)) {
                  handleSubmit(e)
                }
              }
            }}
            disabled={error != null || waitForToolResult}
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
                  data-testid="FormStopButton"
                  onClick={() => stop()}
                  disabled={error != null || waitForToolResult}
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
                  data-testid="FormSubmitButton"
                  type="submit"
                  disabled={
                    error != null || waitForToolResult || isInputEmpty(input)
                  }
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
    </Box>
  )
}
