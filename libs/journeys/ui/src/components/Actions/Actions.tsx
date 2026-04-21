import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback } from 'react'

interface ActionsProps {
  content: string
  onRegenerate?: () => void
  isLastAssistantMessage: boolean
}

export function Actions({
  content,
  onRegenerate,
  isLastAssistantMessage
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
        sx={{ fontSize: 12, color: '#666', minWidth: 0 }}
      >
        {t('Copy')}
      </Button>
      {isLastAssistantMessage && onRegenerate != null && (
        <Button
          size="small"
          onClick={onRegenerate}
          aria-label={t('Regenerate response')}
          sx={{ fontSize: 12, color: '#666', minWidth: 0 }}
        >
          {t('Retry')}
        </Button>
      )}
    </Box>
  )
}
