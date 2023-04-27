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
  position?: 'start' | 'end'
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity,
  duration,
  position
}: Props): ReactElement {
  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          p: 0,
          mr: 2,
          maxWidth: '64px'
        }}
      >
        <Typography variant="body2">
          {position === 'start' && createdAt != null
            ? format(parseISO(createdAt), 'p')
            : duration}
        </Typography>
      </TimelineOppositeContent>

      {icon != null ? (
        <TimelineSeparator
          sx={{
            justifyContent: position === 'end' ? 'flex-end' : 'flex-start'
          }}
        >
          <TimelineConnector
            sx={{
              display: position === 'end' ? 'none' : 'flex'
            }}
          />
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
          <TimelineConnector
            sx={{
              flexGrow: position === 'end' ? '0.5' : '1'
            }}
          />
        </TimelineSeparator>
      ) : (
        <Box sx={{ width: '36px' }} />
      )}

      <TimelineContent
        sx={{ px: 2, py: 4, display: 'flex', alignItems: 'center' }}
      >
        <Stack direction="column" sx={{ width: '100%' }}>
          <Stack direction="row">
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
