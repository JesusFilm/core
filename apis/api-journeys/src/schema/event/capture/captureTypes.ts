import { EventLabel } from '@core/prisma/journeys/client'

export const CAPTURE_EVENTS = {
  ChristDecisionCaptureEvent: {
    tag: 'decisionForChrist',
    identity: 'christDecisionCapture'
  },
  GospelStartCaptureEvent: {
    tag: 'gospelPresentationStart',
    identity: 'gospelStartCapture'
  },
  GospelCompleteCaptureEvent: {
    tag: 'gospelPresentationComplete',
    identity: 'gospelCompleteCapture'
  },
  PrayerRequestCaptureEvent: {
    tag: 'prayerRequest',
    identity: 'prayerRequestCapture'
  },
  RsvpCaptureEvent: { tag: 'rsvp', identity: 'rsvpCapture' },
  SpecialVideoStartCaptureEvent: {
    tag: 'specialVideoStart',
    identity: 'specialVideoStartCapture'
  },
  SpecialVideoCompleteCaptureEvent: {
    tag: 'specialVideoComplete',
    identity: 'specialVideoCompleteCapture'
  },
  Custom1CaptureEvent: { tag: 'custom1', identity: 'custom1Capture' },
  Custom2CaptureEvent: { tag: 'custom2', identity: 'custom2Capture' },
  Custom3CaptureEvent: { tag: 'custom3', identity: 'custom3Capture' }
} as const satisfies Record<string, { tag: EventLabel; identity: string }>

export type CaptureEventTypename = keyof typeof CAPTURE_EVENTS
export const CAPTURE_EVENT_TYPENAMES: string[] = Object.keys(CAPTURE_EVENTS)
export const INTERACTION_EVENT_FILTER = {
  typename: { notIn: CAPTURE_EVENT_TYPENAMES }
}

export const CAPTURE_EVENT_TRIGGERS = [
  'stepView',
  'buttonClick',
  'radioQuestionSubmit',
  'videoStart',
  'videoComplete'
] as const
export type CaptureEventTrigger = (typeof CAPTURE_EVENT_TRIGGERS)[number]

export interface CaptureEventInput {
  id: string
  blockId: string
  stepId: string
  trigger: CaptureEventTrigger
}
