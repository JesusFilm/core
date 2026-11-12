import { TFunction } from 'next-i18next/pages'

import { BlockEventLabel } from '../../../../../../../../../../__generated__/globalTypes'

export type EventLabelType = BlockEventLabel | 'none'

export interface CustomTrackingLabels {
  custom1Label?: string | null
  custom2Label?: string | null
  custom3Label?: string | null
}

export interface EventLabelOption {
  type: EventLabelType
  label: string
}

export function eventLabelOptions(
  t: TFunction,
  labels?: CustomTrackingLabels | null
): EventLabelOption[] {
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
    {
      type: BlockEventLabel.custom1,
      label: labels?.custom1Label ?? t('Custom Tracking 1')
    },
    {
      type: BlockEventLabel.custom2,
      label: labels?.custom2Label ?? t('Custom Tracking 2')
    },
    {
      type: BlockEventLabel.custom3,
      label: labels?.custom3Label ?? t('Custom Tracking 3')
    }
  ]
}
