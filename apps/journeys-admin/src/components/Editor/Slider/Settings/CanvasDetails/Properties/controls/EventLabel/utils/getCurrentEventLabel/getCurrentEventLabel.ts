import { TFunction } from 'next-i18next/pages'

import type { TreeBlock } from '@core/journeys/ui/block'

import type { CustomTrackingLabels, EventLabelOption } from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getCurrentEventLabel(
  t: TFunction,
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete',
  labels?: CustomTrackingLabels | null
): EventLabelOption {
  const options = eventLabelOptions(t, labels)
  if (selectedBlock == null) return options[0]

  const selectedEventLabelType =
    selectedBlock.__typename === 'VideoBlock' && videoActionType === 'complete'
      ? (selectedBlock.endEventLabel ?? 'none')
      : selectedBlock.__typename === 'VideoBlock'
        ? (selectedBlock.eventLabel ?? 'none')
        : 'eventLabel' in selectedBlock
          ? (selectedBlock.eventLabel ?? 'none')
          : 'none'

  return (
    options.find((option) => option.type === selectedEventLabelType) ??
    options[0]
  )
}
