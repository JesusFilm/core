import { ReactElement, ReactNode } from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { format, parseISO } from 'date-fns'

interface Props {
  createdAt?: string
  label?: string | null
  value?: string | ReactNode | null
  icon?: ReactElement
  activity?: string
  duration?: string
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity,
  duration
}: Props): ReactElement {
  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{
          display: 'flex',
          alignItems: icon == null ? 'center' : undefined,
          justifyContent: 'center',
          px: 0,
          mr: 2,
          maxWidth: '64px'
        }}
      >
        <Typography variant="body2">
          {createdAt != null ? format(parseISO(createdAt), 'p') : duration}
        </Typography>
      </TimelineOppositeContent>

      {icon != null ? (
        <TimelineSeparator>
          <TimelineDot
            sx={{
              color: 'text.primary',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              m: 0
            }}
          >
            {icon}
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
      ) : (
        <Box sx={{ width: '36px' }} />
      )}

      <TimelineContent
        sx={{
          display: 'flex',
          alignItems: icon == null ? 'center' : undefined
        }}
      >
        <Stack direction="column" sx={{ width: '100%' }}>
          <Stack direction="row" sx={{ width: '100%' }}>
            {activity != null && (
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {`${activity}:\u00A0`}
              </Typography>
            )}
            {label != null && (
              <Typography variant="body2" gutterBottom>
                {label}
              </Typography>
            )}
          </Stack>
          <Typography variant="subtitle1">{value}</Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  )
}
