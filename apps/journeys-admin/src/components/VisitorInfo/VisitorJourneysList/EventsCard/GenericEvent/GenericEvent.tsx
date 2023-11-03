import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { ReactElement, ReactNode } from 'react'

import { EventVariant, getEventVariant } from '../../utils'

interface GenericEventProps {
  createdAt?: string
  label?: string | null
  value?: string | ReactNode | null
  icon?: ReactElement
  activity?: string
  duration?: string
  variant?: EventVariant
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity,
  duration,
  variant = EventVariant.default
}: GenericEventProps): ReactElement {
  const {
    textAlign,
    durationColor,
    valueColor,
    iconColor,
    durationVariant,
    activityVariant,
    valueVariant
  } = getEventVariant(variant)

  return (
    <TimelineItem>
      {/* Time */}
      <TimelineOppositeContent
        sx={{
          display: 'flex',
          alignItems: textAlign,
          justifyContent: 'center',
          px: 0,
          minWidth: '56px',
          maxWidth: '56px'
        }}
      >
        <Typography variant={durationVariant} color={durationColor}>
          {createdAt != null ? format(parseISO(createdAt), 'p') : duration}
        </Typography>
      </TimelineOppositeContent>

      {/* Icon */}
      {icon != null ? (
        <TimelineSeparator>
          <TimelineDot
            sx={{
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
        <Box sx={{ width: '38px' }} />
      )}

      <TimelineContent
        sx={{
          display: 'flex',
          alignItems: variant === 'title' ? 'center' : undefined,
          pb: 5
        }}
      >
        <Stack direction="column" sx={{ width: '100%', pt: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom={activity != null || label != null}
          >
            {/* activity */}
            {activity != null && (
              <span
                style={{ fontWeight: activityVariant }}
              >{`${activity}\xa0`}</span>
            )}
            {/* label */}
            {label != null && label}
          </Typography>
          {/* Value */}
          <Typography variant={valueVariant} color={valueColor}>
            {value}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  )
}
