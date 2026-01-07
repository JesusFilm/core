import { BlockEventLabel } from 'apps/journeys-admin/__generated__/globalTypes'

export type EventLabelType = BlockEventLabel | 'none'

export interface EventLabelOption {
  type: EventLabelType
  label: string
}

export const eventLabelOptions: EventLabelOption[] = [
  { type: 'none', label: 'None' },
  { type: BlockEventLabel.prayerRequest, label: 'Prayer Request' },
  { type: BlockEventLabel.decisionForChrist, label: 'Decision for Christ' },
  {
    type: BlockEventLabel.gospelPresentationStart,
    label: 'Gospel Presentation Started'
  },
  {
    type: BlockEventLabel.gospelPresentationComplete,
    label: 'Gospel Presentation Completed'
  },
  { type: BlockEventLabel.rsvp, label: 'RSVP' },
  { type: BlockEventLabel.specialVideoStart, label: 'Video Started' },
  {
    type: BlockEventLabel.specialVideoComplete,
    label: 'Video Completed'
  },
  { type: BlockEventLabel.custom1, label: 'Custom Event 1' },
  { type: BlockEventLabel.custom2, label: 'Custom Event 2' },
  { type: BlockEventLabel.custom3, label: 'Custom Event 3' }
]
