import { UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement } from 'react'

interface StateSubmittedProps {
  status: UseChatHelpers['status']
}

export function StateSubmitted({
  status
}: StateSubmittedProps): ReactElement | null {
  return status === 'submitted' ? (
    <Box>
      <CircularProgress size={18} />
    </Box>
  ) : null
}
