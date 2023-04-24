import { ReactElement, ReactNode } from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'

interface Props {
  createdAt?: string
  label?: string | null
  value?: string | ReactNode | null
  icon: ReactElement
  activity?: string
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity
}: Props): ReactElement {
  return (
    <TimelineItem
      sx={{
        '&:before': {
          flex: 0,
          padding: 0
        }
      }}
    >
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
      <TimelineContent sx={{ p: 2, pb: 4 }}>
        {createdAt != null && (
          <Typography variant="body2" gutterBottom>
            {format(parseISO(createdAt), 'p')}
          </Typography>
        )}
        <Typography variant="body2" gutterBottom>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
          {value}
        </Typography>
        {activity != null && (
          <Typography variant="body2">{activity}</Typography>
        )}
      </TimelineContent>
    </TimelineItem>
  )
}
