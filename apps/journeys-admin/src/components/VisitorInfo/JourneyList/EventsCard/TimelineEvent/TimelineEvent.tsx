import { ComponentProps, ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/HelpRounded'
import ListIcon from '@mui/icons-material/ListRounded'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadRounded'
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import MovieIcon from '@mui/icons-material/MovieRounded'
import AnnouncementIcon from '@mui/icons-material/AnnouncementRounded'
import EmojiFlagsRoundedIcon from '@mui/icons-material/EmojiFlagsRounded'
import { useTranslation } from 'react-i18next'
import {
  videoBlockSourceToLabel,
  messagePlatformToLabel,
  TimelineItem
} from '../../utils'
import { GenericEvent } from '../GenericEvent'

interface Props {
  timelineItem: TimelineItem
}

type GenericEventProps = ComponentProps<typeof GenericEvent>

export function TimelineEvent({ timelineItem }: Props): ReactElement {
  const { event, duration } = timelineItem

  const { t } = useTranslation('apps-journeys-admin')

  let icon = <RadioButtonUncheckedIcon />
  let label: GenericEventProps['label']
  let value: GenericEventProps['value'] = event.value
  let activity: GenericEventProps['activity']
  const position: 'start' | 'end' | undefined =
    event.__typename === 'JourneyViewEvent'
      ? 'start'
      : duration == null
      ? 'end'
      : undefined

  switch (event.__typename) {
    case 'RadioQuestionSubmissionEvent':
      icon = <ListIcon />
      label = event.label
      activity = t('Poll selected')
      break
    case 'TextResponseSubmissionEvent':
      icon = <HelpIcon />
      label = event.label
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
    case 'JourneyViewEvent':
      icon = <EmojiFlagsRoundedIcon />
      value = t('Journey Started')
      break
  }

  return (
    <GenericEvent
      icon={icon}
      createdAt={event.createdAt}
      label={label}
      value={value}
      activity={activity}
      duration={duration}
      position={position}
    />
  )
}
