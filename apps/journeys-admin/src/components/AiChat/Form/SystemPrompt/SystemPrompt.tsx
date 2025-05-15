import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LanguageModelUsage } from 'ai'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

// @ts-expect-error - This is a markdown file
import initialSystemPrompt from './systemPrompt.md'

interface SystemPromptProps {
  value: string
  onChange: (value: string) => void
  usage: LanguageModelUsage | null
}

export function SystemPrompt({
  value,
  onChange,
  usage
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
          '& .expanded': {
            display: 'none'
          },
          '& .collapsed': {
            display: 'block'
          },
          '&.Mui-expanded': {
            minHeight: 32,
            p: 0,
            '& .expanded': {
              display: 'block'
            },
            '& .collapsed': {
              display: 'none'
            }
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
          <Typography component="span" variant="body2" className="collapsed">
            {t('NextSteps AI can make mistakes. Check important info.')}
          </Typography>
          <Typography component="span" variant="body2" className="expanded">
            {usage?.totalTokens ?? 0} {t('Tokens Used')}
          </Typography>
          <Typography component="span" variant="body2">
            {t('Advanced Settings')}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, pt: 2 }}>
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
      </AccordionDetails>
    </Accordion>
  )
}
