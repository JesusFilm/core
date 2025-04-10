export const EVENT_CSV_OPTIONS = {
  header: true,
  columns: [
    { key: 'createdAt', header: 'Date & Time' },
    { key: 'visitorId', header: 'Visitor ID' },
    { key: 'visitorName', header: 'Name' },
    { key: 'visitorEmail', header: 'Email' },
    { key: 'visitorPhone', header: 'Phone' },
    { key: 'journeyId', header: 'Journey ID' },
    { key: 'journeySlug', header: 'Slug' },
    { key: 'typename', header: 'Event Type' },
    { key: 'label', header: 'Label' },
    { key: 'value', header: 'Value' }
  ]
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
