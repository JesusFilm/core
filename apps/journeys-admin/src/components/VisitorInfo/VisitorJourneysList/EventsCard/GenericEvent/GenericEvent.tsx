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
  variant?: 'default' | 'featured' | 'chat' | 'title'
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity,
  duration,
  variant = 'default'
}: Props): ReactElement {
  let textAlign: string | undefined
  let iconColor = 'secondary.light'
  let color: string | undefined
  let durationVariant = 'caption'
  let activityVariant = 'body2'
  let valueVariant = 'body2'
  switch (variant) {
    case 'title':
      textAlign = 'center'
      durationVariant = 'body2'
      valueVariant = 'h3'
      break
    case 'chat':
      color = 'primary'
      iconColor = 'primary.main'
      valueVariant = 'subtitle1'
      break
    case 'featured':
      activityVariant = 'body2'
      valueVariant = 'subtitle1'
      color = 'secondary.dark'
      break
  }

  return (
    <TimelineItem>
      {/* Time */}
      <TimelineOppositeContent
        sx={{
          display: 'flex',
          alignItems: textAlign,
          justifyContent: 'center',
          px: 0,
          mr: 2,
          maxWidth: '64px'
        }}
      >
        <Typography variant={durationVariant} color={color}>
          {createdAt != null ? format(parseISO(createdAt), 'p') : duration}
        </Typography>
      </TimelineOppositeContent>

      {/* Icon */}
      {icon != null ? (
        <TimelineSeparator>
          <TimelineDot
            sx={{
              // color: 'text.primary',
              color: iconColor,
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
          alignItems: variant === 'title' ? 'center' : undefined
        }}
      >
        <Stack direction="column" sx={{ width: '100%' }}>
          <Stack direction="row" sx={{ width: '100%' }}>
            {/* Activity */}
            {activity != null && (
              <Typography
                variant={activityVariant}
                color={color}
                sx={{ fontWeight: 'bold' }}
              >
                {`${activity}:\u00A0`}
              </Typography>
            )}
            {/* Label */}
            {label != null && (
              <Typography variant="body2" gutterBottom>
                {label}
              </Typography>
            )}
          </Stack>
          {/* Value */}
          <Typography variant={valueVariant} color={color}>
            {value}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  )
}
