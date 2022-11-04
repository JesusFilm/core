import { ComponentProps, ReactElement } from 'react'
import HelpIcon from '@mui/icons-material/HelpRounded'
import ListIcon from '@mui/icons-material/ListRounded'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadRounded'
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import MovieIcon from '@mui/icons-material/MovieRounded'
import { useTranslation } from 'react-i18next'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
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

  function videoBlockSourceToLabel(source: VideoBlockSource | null): string {
    switch (source) {
      case VideoBlockSource.internal:
        return t('Jesus Film Library')
      case VideoBlockSource.youTube:
        return t('YouTube')
      default:
        return t('Video')
    }
  }

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
      label = videoBlockSourceToLabel(event.source)
      value = event.label
      activity = t('Video completed')
      break
    case 'VideoStartEvent':
      icon = <PlayArrowIcon />
      label = videoBlockSourceToLabel(event.source)
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
