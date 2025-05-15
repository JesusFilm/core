import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { lighten } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

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
  switch (part.toolInvocation.state) {
    case 'call':
      if (callText == null) return null
      return <ShimmerTypography>{callText}</ShimmerTypography>
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

function ShimmerTypography({
  children
}: {
  children: ReactNode
}): ReactElement {
  return (
    <Box>
      <Typography
        component="span"
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.text.secondary}, ${lighten(theme.palette.text.secondary, 0.75)}, ${theme.palette.text.secondary})`,
          backgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
          '@keyframes shimmer': {
            '0%': {
              backgroundPosition: '200% 0'
            },
            '100%': {
              backgroundPosition: '-200% 0'
            }
          }
        }}
      >
        {children}
      </Typography>
    </Box>
  )
}
