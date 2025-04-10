import { TFunction } from 'i18next'

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

const ALL_EVENT_TYPES = [
  'ButtonClickEvent',
  'ChatOpenEvent',
  'JourneyViewEvent',
  'RadioQuestionSubmissionEvent',
  'SignUpSubmissionEvent',
  'StepViewEvent',
  'StepNextEvent',
  'StepPreviousEvent',
  'TextResponseSubmissionEvent',
  'VideoStartEvent',
  'VideoPlayEvent',
  'VideoPauseEvent',
  'VideoCompleteEvent',
  'VideoExpandEvent',
  'VideoCollapseEvent',
  'VideoProgressEvent'
]

export const FILTERED_EVENTS = ALL_EVENT_TYPES.filter((event) => {
  if (
    event === 'StepViewEvent' ||
    event === 'StepNextEvent' ||
    event === 'StepPreviousEvent' ||
    event === 'VideoExpandEvent' ||
    event === 'VideoCollapseEvent'
  ) {
    return false
  } else {
    return true
  }
})
