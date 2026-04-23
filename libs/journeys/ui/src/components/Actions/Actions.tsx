import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback } from 'react'

interface ActionsProps {
  content: string
  /** Use light colours suitable for a dark overlay backdrop. */
  plain?: boolean
}

export function Actions({
  content,
  plain = false
}: ActionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
  }, [content])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        px: 2,
        py: 0.25
      }}
    >
      <Button
        size="small"
        onClick={handleCopy}
        aria-label={t('Copy message')}
        sx={{
          fontSize: 12,
          color: plain ? 'rgba(255, 255, 255, 0.6)' : '#666',
          minWidth: 0,
          '&:hover': {
            color: plain ? 'rgba(255, 255, 255, 0.9)' : '#666',
            bgcolor: plain ? 'rgba(255, 255, 255, 0.08)' : undefined
          }
        }}
      >
        {t('Copy')}
      </Button>
    </Box>
  )
}
