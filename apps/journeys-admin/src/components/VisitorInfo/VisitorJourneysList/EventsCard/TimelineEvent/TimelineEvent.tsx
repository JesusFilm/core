import { ComponentProps, ReactElement } from 'react'
import { format, parseISO } from 'date-fns'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import EmojiFlagsRoundedIcon from '@mui/icons-material/EmojiFlagsRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
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
      icon = <ChatBubbleOutlineRoundedIcon />
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
      icon = <ChatBubbleOutlineRoundedIcon />
      activity = `${t('Text submitted')}:`
      label = event.label
      variant = EventVariant.featured
      break
    case 'ButtonClickEvent':
      icon = <CheckCircleOutlineRoundedIcon />
      activity = `${t('Button click')}:`
      label = getButtonLabel(event, t)
      value = event.label
      variant = EventVariant.featured
      break
    case 'SignUpSubmissionEvent':
      activity = `${t('Form submitted')}:`
      icon = <MailOutlineRoundedIcon />
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
      icon = <CheckCircleOutlineRoundedIcon />
      activity = `${t('Poll')}:`
      label = event.label
      variant = EventVariant.featured
      break

    // default
    case 'StepNextEvent':
      icon = <ArrowCircleRightOutlinedIcon />
      activity = `${t('Skip Step')}:`
      label = event.label
      break
    case 'StepViewEvent':
      icon = <ArrowCircleRightOutlinedIcon />
      activity = t('Next Step')
      break

    // Video
    case 'VideoStartEvent':
      icon = <PlayCircleOutlineRoundedIcon />
      activity = t('Video Start')
      value = event.label
      break
    case 'VideoPlayEvent':
      icon = <PlayCircleOutlineRoundedIcon />
      activity = t('Video Play')
      value = event.label
      break
    case 'VideoPauseEvent':
      icon = <PauseCircleOutlineRoundedIcon />
      activity = t('Video Pause')
      value = `${event.label as string} paused at ${videoPositionToLabel(
        event.position
      )}`
      break
    case 'VideoProgressEvent':
      icon = <PlayCircleOutlineRoundedIcon />
      activity = `${t('Video Progress')} ${event.progress}%`
      value = event.label
      break
    case 'VideoExpandEvent':
      icon = <PlayCircleOutlineRoundedIcon />
      activity = `${t(
        'Video expanded to fullscreen at'
      )} (${videoPositionToLabel(event.position)})`
      value = event.label
      break
    case 'VideoCompleteEvent':
      icon = <PlayCircleOutlineRoundedIcon />
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
