import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'

import { langfuseWeb } from '../../../../libs/ai/langfuse/client'

interface UserFeedbackProps {
  traceId: string
}

export function UserFeedback({ traceId }: UserFeedbackProps) {
  const [feedback, setFeedback] = useState<number | null>(null)

  function handleUserFeedback(value: number) {
    setFeedback(value)
    void langfuseWeb.score({
      traceId,
      name: 'user_feedback',
      value
    })
  }

  return (
    <Stack direction="row" spacing={2} mt={1}>
      <Tooltip title="Good Response" arrow>
        <IconButton
          onClick={() => handleUserFeedback(1)}
          color={feedback === 1 ? 'primary' : 'default'}
          size="small"
        >
          <ThumbsUp fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bad Response" arrow>
        <IconButton
          onClick={() => handleUserFeedback(0)}
          color={feedback === 0 ? 'primary' : 'default'}
          size="small"
        >
          <ThumbsDown fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
