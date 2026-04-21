import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
        aria-label="Copy message"
        sx={{ fontSize: 12, color: '#666', minWidth: 0 }}
      >
        Copy
      </Button>
      {isLastAssistantMessage && onRegenerate != null && (
        <Button
          size="small"
          onClick={onRegenerate}
          aria-label="Regenerate response"
          sx={{ fontSize: 12, color: '#666', minWidth: 0 }}
        >
          Retry
        </Button>
      )}
    </Box>
  )
}
