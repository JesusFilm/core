import { ComponentProps, ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/Help'
import ListIcon from '@mui/icons-material/List'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useTranslation } from 'react-i18next'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../__generated__/GetVisitorEvents'
import { GenericEvent } from './GenericEvent'

interface Props {
  event: Event
  variant?: 'compact'
}

type GenericEventProps = ComponentProps<typeof GenericEvent>

export function VisitorJourneyTimelineItem({
  event,
  variant
}: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  let icon = <RadioButtonUncheckedIcon />
  let label: GenericEventProps['label'] = event.label
  let value: GenericEventProps['value'] = event.value
  let activity: GenericEventProps['activity']

  switch (event.__typename) {
    case 'RadioQuestionSubmissionEvent':
      icon = <ListIcon />
      activity = t('Poll selected')
      break
    case 'TextResponseSubmissionEvent':
      icon = <HelpIcon />
      break
    case 'SignUpSubmissionEvent':
      icon = <MarkEmailReadIcon />
      label = t('Sign Up')
      value = (
        <>
          {event.value}
          <br />
          {event.email}
        </>
      )
      activity = t('Button clicked')
      break
    case 'ButtonClickEvent':
      activity = t('Button clicked')
  }

  return (
    <GenericEvent
      icon={icon}
      createdAt={event.createdAt}
      label={label}
      value={value}
      variant={variant}
      activity={activity}
    />
  )
}
