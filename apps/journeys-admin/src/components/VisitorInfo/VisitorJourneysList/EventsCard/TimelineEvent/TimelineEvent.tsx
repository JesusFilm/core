import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import EmojiFlagsRoundedIcon from '@mui/icons-material/EmojiFlagsRounded'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { intlFormat, parseISO } from 'date-fns'
import { ComponentProps, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import {
  EventVariant,
  TimelineItem,
  getButtonLabel,
  messagePlatformToLabel,
  videoPositionToLabel
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
      value = intlFormat(parseISO(event.createdAt), {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric'
      })
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
      icon = <ArrowCircleRightOutlinedIcon color="disabled" />
      activity = `${t('Skip Step')}:`
      label = event.label
      break
    case 'StepViewEvent':
      icon = <ArrowCircleRightOutlinedIcon color="disabled" />
      activity = t('Next Step')
      break

    // Video
    case 'VideoStartEvent':
      icon = <PlayCircleOutlineRoundedIcon color="disabled" />
      activity = t('Video Start')
      value = event.label
      break
    case 'VideoPlayEvent':
      icon = <PlayCircleOutlineRoundedIcon color="disabled" />
      activity = t('Video Play')
      value = event.label
      break
    case 'VideoPauseEvent':
      icon = <PauseCircleOutlineRoundedIcon color="disabled" />
      activity = t('Video Pause')
      value = `${event.label as string} paused at ${videoPositionToLabel(
        event.position
      )}`
      break
    case 'VideoProgressEvent':
      icon = <PlayCircleOutlineRoundedIcon color="disabled" />
      activity = `${t('Video Progress')} ${
        event.progress as unknown as string
      }%`
      value = event.label
      break
    case 'VideoExpandEvent':
      icon = <PlayCircleOutlineRoundedIcon color="disabled" />
      activity = `${t(
        'Video expanded to fullscreen at'
      )} (${videoPositionToLabel(event.position)})`
      value = event.label
      break
    case 'VideoCompleteEvent':
      icon = <PlayCircleOutlineRoundedIcon color="disabled" />
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
