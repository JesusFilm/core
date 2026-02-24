import { TFunction } from 'next-i18next'

import { BlockEventLabel } from '../../../../../../../../../../__generated__/globalTypes'

export type EventLabelType = BlockEventLabel | 'none'

export interface EventLabelOption {
  type: EventLabelType
  label: string
}

export function eventLabelOptions(t: TFunction): EventLabelOption[] {
  return [
    { type: 'none', label: t('None') },
    { type: BlockEventLabel.prayerRequest, label: t('Prayer Request') },
    {
      type: BlockEventLabel.decisionForChrist,
      label: t('Decision for Christ')
    },
    {
      type: BlockEventLabel.gospelPresentationStart,
      label: t('Gospel Presentation Started')
    },
    {
      type: BlockEventLabel.gospelPresentationComplete,
      label: t('Gospel Presentation Completed')
    },
    { type: BlockEventLabel.rsvp, label: t('RSVP') },
    { type: BlockEventLabel.specialVideoStart, label: t('Video Started') },
    {
      type: BlockEventLabel.specialVideoComplete,
      label: t('Video Completed')
    },
    { type: BlockEventLabel.custom1, label: t('Custom Tracking 1') },
    { type: BlockEventLabel.custom2, label: t('Custom Tracking 2') },
    { type: BlockEventLabel.custom3, label: t('Custom Tracking 3') }
  ]
}
