import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface BasicToolProps {
  part: ToolInvocationUIPart
  callText?: string
  resultText?: string
}

export function BasicTool({
  part,
  callText,
  resultText
}: BasicToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  switch (part.toolInvocation.state) {
    case 'call':
      if (callText == null) return null
      return (
        <Typography variant="body2" color="text.secondary">
          {callText}
        </Typography>
      )
    case 'result': {
      if (resultText == null) return null
      return (
        <Box>
          <Chip label={resultText} size="small" />
        </Box>
      )
    }
    default: {
      return null
    }
  }
}
