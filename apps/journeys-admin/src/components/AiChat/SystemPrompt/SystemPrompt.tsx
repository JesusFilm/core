import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

// @ts-expect-error - This is a markdown file
import initialSystemPrompt from './systemPrompt.md'

interface SystemPromptProps {
  value: string
  onChange: (value: string) => void
}

export function SystemPrompt({
  value,
  onChange
}: SystemPromptProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [localStorageSet, setLocalStorageSet] = useState(false)

  useEffect(() => {
    const localStorageSystemPrompt = localStorage.getItem('systemPrompt')
    if (localStorageSystemPrompt != null) {
      onChange(localStorageSystemPrompt)
      setLocalStorageSet(true)
    } else {
      onChange(initialSystemPrompt)
    }
  }, [onChange])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    localStorage.setItem('systemPrompt', e.target.value)
    setLocalStorageSet(true)
    onChange(e.target.value)
  }

  function handleReset() {
    localStorage.removeItem('systemPrompt')
    setLocalStorageSet(false)
    onChange(initialSystemPrompt)
  }

  return (
    <Stack spacing={2}>
      <TextField
        name="systemPrompt"
        fullWidth
        aria-label={t('System Prompt')}
        placeholder={t('Instructions for the AI')}
        value={value}
        onChange={handleChange}
        multiline
        maxRows={10}
        sx={{
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
            fontSize: '11.2px'
          }
        }}
      />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="caption" color="text.secondary">
          {localStorageSet
            ? t('System Prompt loaded from local storage')
            : t('System Prompt loaded from server')}
        </Typography>
        <Button onClick={handleReset} disabled={!localStorageSet}>
          {t('Reset')}
        </Button>
      </Stack>
    </Stack>
  )
}
