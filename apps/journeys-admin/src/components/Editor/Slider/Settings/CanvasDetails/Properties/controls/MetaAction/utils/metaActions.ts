// TODO: get real types for backend
export type MetaActionType =
  | 'none'
  | 'prayerRequestCapture'
  | 'christDecisionCapture'
  | 'gospelStartCapture'
  | 'gospelCompleteCapture'
  | 'rsvpCapture'
  | 'specialVideoStartCapture'
  | 'specialVideoCompleteCapture'
  | 'custom1Capture'
  | 'custom2Capture'
  | 'custom3Capture'

export interface MetaAction {
  type: MetaActionType
  label: string
}

export const metaActions: MetaAction[] = [
  { type: 'none', label: 'None' },
  { type: 'prayerRequestCapture', label: 'Prayer Request' },
  { type: 'christDecisionCapture', label: 'Decision for Christ' },
  {
    type: 'gospelStartCapture',
    label: 'Gospel Presentation Started'
  },
  {
    type: 'gospelCompleteCapture',
    label: 'Gospel Presentation Completed'
  },
  { type: 'rsvpCapture', label: 'RSVP' },
  { type: 'specialVideoStartCapture', label: 'Video Started' },
  {
    type: 'specialVideoCompleteCapture',
    label: 'Video Completed'
  },
  { type: 'custom1Capture', label: 'Custom Event 1' },
  { type: 'custom2Capture', label: 'Custom Event 2' },
  { type: 'custom3Capture', label: 'Custom Event 3' }
]
