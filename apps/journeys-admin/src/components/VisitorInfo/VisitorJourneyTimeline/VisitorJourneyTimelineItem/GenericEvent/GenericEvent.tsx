import { ReactElement } from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

interface Props {
  event: Event
  variant?: 'compact'
  icon?: ReactElement
}

export function GenericEvent({ icon, event, variant }: Props): ReactElement {
  return (
    <TimelineItem>
      {variant !== 'compact' && (
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          9:30 am
        </TimelineOppositeContent>
      )}

      <TimelineSeparator>
        {variant !== 'compact' && <TimelineConnector />}
        <TimelineDot>{icon ?? <RadioButtonUncheckedIcon />}</TimelineDot>
        {variant !== 'compact' && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography>{event.label}</Typography>
        <Typography variant="h6">{event.value}</Typography>
      </TimelineContent>
    </TimelineItem>
  )
}
