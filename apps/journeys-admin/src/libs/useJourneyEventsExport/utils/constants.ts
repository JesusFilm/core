import { TFunction } from 'i18next'

import { EventType } from '../../../../__generated__/globalTypes'

export function getTranslatedCsvOptions(t: TFunction) {
  return {
    header: true,
    columns: [
      { key: 'createdAt', header: t('Date & Time') },
      { key: 'visitorId', header: t('Visitor ID') },
      { key: 'visitorName', header: t('Name') },
      { key: 'visitorEmail', header: t('Email') },
      { key: 'visitorPhone', header: t('Phone') },
      { key: 'journeyId', header: t('Journey ID') },
      { key: 'journeySlug', header: t('Slug') },
      { key: 'typename', header: t('Event Type') },
      { key: 'label', header: t('Label') },
      { key: 'value', header: t('Value') }
    ]
  }
}

const ALL_EVENT_TYPES = Object.values(EventType) as string[]

export const FILTERED_EVENTS = ALL_EVENT_TYPES.filter(
  (event) =>
    event === 'ButtonClickEvent' ||
    event === 'ChatOpenEvent' ||
    event === 'JourneyViewEvent' ||
    event === 'RadioQuestionSubmissionEvent' ||
    event === 'SignUpSubmissionEvent' ||
    event === 'TextResponseSubmissionEvent' ||
    event === 'VideoStartEvent' ||
    event === 'VideoPlayEvent' ||
    event === 'VideoPauseEvent' ||
    event === 'VideoCompleteEvent' ||
    event === 'VideoProgressEvent'
)
