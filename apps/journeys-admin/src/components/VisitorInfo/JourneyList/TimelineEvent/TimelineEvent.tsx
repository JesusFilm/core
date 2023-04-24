import { ComponentProps, ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/HelpRounded'
import ListIcon from '@mui/icons-material/ListRounded'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadRounded'
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import MovieIcon from '@mui/icons-material/MovieRounded'
import AnnouncementIcon from '@mui/icons-material/AnnouncementRounded'
import { useTranslation } from 'react-i18next'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../__generated__/GetVisitorEvents'
import { videoBlockSourceToLabel } from '../../videoBlockSourceToLabel'
import { messagePlatformToLabel } from '../../messagePlatformToLabel'
import { GenericEvent } from './GenericEvent'

interface Props {
  event: Event
}

type GenericEventProps = ComponentProps<typeof GenericEvent>

export function TimelineEvent({ event }: Props): ReactElement {
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
      activity = t('Response submitted')
      break
    case 'VideoCompleteEvent':
      icon = <MovieIcon />
      label =
        event.source != null
          ? videoBlockSourceToLabel(event.source, t)
          : t('Video')
      value = event.label
      activity = t('Video completed')
      break
    case 'VideoStartEvent':
      icon = <PlayArrowIcon />
      label =
        event.source != null
          ? videoBlockSourceToLabel(event.source, t)
          : t('Video')
      value = event.label
      activity = t('Video started')
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
      activity = t('Form submitted')
      break
    case 'ButtonClickEvent':
      activity = t('Button clicked')
      break
    case 'ChatOpenEvent':
      icon = <AnnouncementIcon />
      label = t('Chat Opened')
      value = t('Chat started on {{messagePlatform}}', {
        messagePlatform:
          event.messagePlatform != null
            ? messagePlatformToLabel(event.messagePlatform, t)
            : t('Message Platform')
      })
      break
  }

  return (
    <GenericEvent
      icon={icon}
      createdAt={event.createdAt}
      label={label}
      value={value}
      activity={activity}
    />
  )
}
