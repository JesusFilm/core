import { intlFormat, parseISO } from 'date-fns'
import { ComponentProps, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import ArrowRightContained1Icon from '@core/shared/ui/icons/ArrowRightContained1'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import CircleIcon from '@core/shared/ui/icons/Circle'
import EmailIcon from '@core/shared/ui/icons/Email'
import Marker1Icon from '@core/shared/ui/icons/Marker1'
import MessageText1Icon from '@core/shared/ui/icons/MessageText1'
import Pause2Icon from '@core/shared/ui/icons/Pause2'
import Play2Icon from '@core/shared/ui/icons/Play2'

import {
  EventVariant,
  TimelineItem,
  getButtonLabel,
  messagePlatformToLabel,
  videoPositionToLabel
} from '../../utils'
import { GenericEvent } from '../GenericEvent'

interface TimelineEventProps {
  timelineItem: TimelineItem
}

type GenericEventProps = ComponentProps<typeof GenericEvent>

export function TimelineEvent({
  timelineItem
}: TimelineEventProps): ReactElement {
  const { event, duration } = timelineItem

  const { t } = useTranslation('apps-journeys-admin')

  let variant: EventVariant = EventVariant.default
  let icon = <CircleIcon />
  let label: GenericEventProps['label']
  let value: GenericEventProps['value'] = event.value
  let activity: GenericEventProps['activity']
  let createdAt: GenericEventProps['createdAt']

  switch (event.__typename) {
    // Featured
    case 'JourneyViewEvent':
      icon = <Marker1Icon />
      value = t('Journey Started')
      createdAt = event.createdAt
      variant = EventVariant.start
      break
    case 'ChatOpenEvent':
      icon = <MessageText1Icon />
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
      icon = <MessageText1Icon />
      activity = `${t('Text submitted')}:`
      label = event.label
      variant = EventVariant.featured
      break
    case 'ButtonClickEvent':
      icon = <CheckContainedIcon />
      activity = `${t('Button click')}:`
      label = getButtonLabel(event, t)
      value = event.label
      variant = EventVariant.featured
      break
    case 'SignUpSubmissionEvent':
      activity = `${t('Form submitted')}:`
      icon = <EmailIcon />
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
      icon = <CheckContainedIcon />
      activity = `${t('Poll')}:`
      label = event.label
      variant = EventVariant.featured
      break

    // default
    case 'StepNextEvent':
      icon = <ArrowRightContained1Icon color="disabled" />
      activity = `${t('Skip Step')}:`
      label = event.label
      break
    case 'StepViewEvent':
      icon = <ArrowRightContained1Icon color="disabled" />
      activity = t('Next Step')
      break

    // Video
    case 'VideoStartEvent':
      icon = <Play2Icon color="disabled" />
      activity = t('Video Start')
      value = event.label
      break
    case 'VideoPlayEvent':
      icon = <Play2Icon color="disabled" />
      activity = t('Video Play')
      value = event.label
      break
    case 'VideoPauseEvent':
      icon = <Pause2Icon color="disabled" />
      activity = t('Video Pause')
      value = `${event.label as string} paused at ${videoPositionToLabel(
        event.position
      )}`
      break
    case 'VideoProgressEvent':
      icon = <Play2Icon color="disabled" />
      activity = `${t('Video Progress')} ${
        event.progress as unknown as string
      }%`
      value = event.label
      break
    case 'VideoExpandEvent':
      icon = <Play2Icon color="disabled" />
      activity = `${t(
        'Video expanded to fullscreen at'
      )} (${videoPositionToLabel(event.position)})`
      value = event.label
      break
    case 'VideoCompleteEvent':
      icon = <Play2Icon color="disabled" />
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
