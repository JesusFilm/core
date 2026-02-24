import { TFunction } from 'next-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockEventLabel } from '../../../../../../../../../../../__generated__/globalTypes'
import type { EventLabelOption, EventLabelType } from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getFilteredEventLabels(
  t: TFunction,
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): EventLabelOption[] {
  const options = eventLabelOptions(t)

  if (selectedBlock == null) {
    return options
  }

  const allowedEventLabelTypes: EventLabelType[] = []

  switch (selectedBlock.__typename) {
    case 'CardBlock':
      allowedEventLabelTypes.push(
        'none',
        BlockEventLabel.decisionForChrist,
        BlockEventLabel.gospelPresentationStart,
        BlockEventLabel.gospelPresentationComplete,
        BlockEventLabel.custom1,
        BlockEventLabel.custom2,
        BlockEventLabel.custom3
      )
      break

    case 'ButtonBlock': {
      const isSubmitButton =
        'submitEnabled' in selectedBlock && selectedBlock.submitEnabled === true

      if (isSubmitButton) {
        allowedEventLabelTypes.push(
          'none',
          BlockEventLabel.rsvp,
          BlockEventLabel.prayerRequest,
          BlockEventLabel.decisionForChrist,
          BlockEventLabel.custom1,
          BlockEventLabel.custom2,
          BlockEventLabel.custom3
        )
      } else {
        allowedEventLabelTypes.push(
          'none',
          BlockEventLabel.decisionForChrist,
          BlockEventLabel.prayerRequest,
          BlockEventLabel.gospelPresentationStart,
          BlockEventLabel.gospelPresentationComplete,
          BlockEventLabel.custom1,
          BlockEventLabel.custom2,
          BlockEventLabel.custom3
        )
      }
      break
    }

    case 'RadioOptionBlock':
      allowedEventLabelTypes.push(
        'none',
        BlockEventLabel.prayerRequest,
        BlockEventLabel.decisionForChrist,
        BlockEventLabel.gospelPresentationStart,
        BlockEventLabel.gospelPresentationComplete,
        BlockEventLabel.custom1,
        BlockEventLabel.custom2,
        BlockEventLabel.custom3
      )
      break

    case 'VideoBlock': {
      if (videoActionType == null) {
        return options
      }
      if (videoActionType === 'start') {
        allowedEventLabelTypes.push(
          'none',
          BlockEventLabel.specialVideoStart,
          BlockEventLabel.gospelPresentationStart,
          BlockEventLabel.decisionForChrist,
          BlockEventLabel.prayerRequest,
          BlockEventLabel.custom1,
          BlockEventLabel.custom2,
          BlockEventLabel.custom3
        )
      } else if (videoActionType === 'complete') {
        allowedEventLabelTypes.push(
          'none',
          BlockEventLabel.specialVideoComplete,
          BlockEventLabel.gospelPresentationComplete,
          BlockEventLabel.decisionForChrist,
          BlockEventLabel.prayerRequest,
          BlockEventLabel.custom1,
          BlockEventLabel.custom2,
          BlockEventLabel.custom3
        )
      }
      break
    }

    default:
      return options
  }

  return options.filter((option) =>
    allowedEventLabelTypes.includes(option.type)
  )
}
