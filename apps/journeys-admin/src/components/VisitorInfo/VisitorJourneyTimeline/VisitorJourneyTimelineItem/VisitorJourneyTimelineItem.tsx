import { ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/Help'
import ListIcon from '@mui/icons-material/List'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../__generated__/GetVisitorEvents'
import { GenericEvent } from './GenericEvent'

interface Props {
  event: Event
  variant?: 'compact'
}

export function VisitorJourneyTimelineItem({
  event,
  variant
}: Props): ReactElement {
  let icon = <RadioButtonUncheckedIcon />

  switch (event.__typename) {
    case 'RadioQuestionSubmissionEvent':
      icon = <ListIcon />
      break
    case 'TextResponseSubmissionEvent':
      icon = <HelpIcon />
      break
  }

  return <GenericEvent icon={icon} event={event} variant={variant} />
}
