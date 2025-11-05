import { builder } from '../../builder'

export const EventType = builder.enumType('EventType', {
  values: [
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
  ] as const
})
