import { ComponentProps, ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/HelpRounded'
import ListIcon from '@mui/icons-material/ListRounded'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadRounded'
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { format, parseISO } from 'date-fns'
import MovieIcon from '@mui/icons-material/MovieRounded'
import AnnouncementIcon from '@mui/icons-material/AnnouncementRounded'
import EmojiFlagsRoundedIcon from '@mui/icons-material/EmojiFlagsRounded'
import { useTranslation } from 'react-i18next'
import {
  messagePlatformToLabel,
  TimelineItem,
  EventVariant,
  videoPositionToLabel,
  getButtonLabel
} from '../../utils'
import { GenericEvent } from '../GenericEvent'

interface Props {
  timelineItem: TimelineItem
}

type GenericEventProps = ComponentProps<typeof GenericEvent>

export function TimelineEvent({ timelineItem }: Props): ReactElement {
  const { event, duration } = timelineItem

  const { t } = useTranslation('apps-journeys-admin')

  let variant: EventVariant = EventVariant.default
  let icon = <RadioButtonUncheckedIcon />
  let label: GenericEventProps['label']
  let value: GenericEventProps['value'] = event.value
  let activity: GenericEventProps['activity']
  let createdAt: GenericEventProps['createdAt']

  switch (event.__typename) {
    // Featured
    case 'JourneyViewEvent':
      icon = <EmojiFlagsRoundedIcon />
      value = t('Journey Started')
      createdAt = event.createdAt
      variant = EventVariant.start
      break
    case 'ChatOpenEvent':
      icon = <AnnouncementIcon />
      activity = `${t('Chat Opened')}:`
      label = t('{{messagePlatform}}', {
        messagePlatform:
          event.messagePlatform != null
            ? messagePlatformToLabel(event.messagePlatform, t)
            : t('Message Platform')
      })
      value = format(parseISO(event.createdAt), 'h:m aaa LLL. d')
      variant = EventVariant.chat
      break
    case 'TextResponseSubmissionEvent':
      icon = <HelpIcon />
      activity = `${t('Text submitted')}:`
      label = event.label
      variant = EventVariant.featured
      break
    case 'ButtonClickEvent':
      activity = `${t('Button click')}:`
      label = getButtonLabel(event, t)
      value = event.label
      variant = EventVariant.featured
      break
    case 'SignUpSubmissionEvent':
      activity = `${t('Form submitted')}:`
      icon = <MarkEmailReadIcon />
      label = t('Sign Up Submission')
      value = (
        <>
          {event.value}
          <br />
          {event.email}
        </>
      )
      variant = EventVariant.featured
      break
    case 'RadioQuestionSubmissionEvent':
      icon = <ListIcon />
      activity = `${t('Poll')}:`
      label = event.label
      variant = EventVariant.featured
      break

    // default
    case 'StepNextEvent':
      // icon =
      activity = `${t('Skip Step')}:`
      label = event.label
      break
    case 'StepViewEvent':
      activity = t('Next Step')
      break

    // Video
    case 'VideoStartEvent':
      icon = <PlayArrowIcon />
      activity = t('Video Start')
      value = event.label
      break
    case 'VideoPlayEvent':
      icon = <PlayArrowIcon />
      activity = t('Video Play')
      value = event.label
      break
    case 'VideoPauseEvent':
      icon = <PlayArrowIcon />
      activity = t('Video Pause')
      value = `${event.label as string} paused at ${videoPositionToLabel(
        event.position
      )}`
      break
    case 'VideoProgressEvent':
      icon = <PlayArrowIcon />
      activity = `${t('Video Progress')} ${event.progress}%`
      value = event.label
      break
    case 'VideoExpandEvent':
      icon = <PlayArrowIcon />
      activity = `${t(
        'Video expanded to fullscreen at'
      )} (${videoPositionToLabel(event.position)})`
      value = event.label
      break
    case 'VideoCompleteEvent':
      icon = <MovieIcon />
      activity = t('Video completed')
      value = event.label
      break
  }

  return (
    <GenericEvent
      icon={icon}
      createdAt={createdAt}
      label={label}
      value={value}
      activity={activity}
      duration={duration}
      variant={variant}
    />
  )
}
