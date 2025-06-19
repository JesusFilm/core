import { UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import { ReactElement } from 'react'

interface StateLoadingProps {
  status: UseChatHelpers['status']
}

export function StateLoading({
  status
}: StateLoadingProps): ReactElement | null {
  return (
    <Box>
      <Collapse in={status === 'submitted'}>
        <Box sx={{ height: 24, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={18} />
        </Box>
      </Collapse>
    </Box>
  )
}
