import type { TreeBlock } from '@core/journeys/ui/block'

import type { EventLabelOption } from '../eventLabels'
import { eventLabelOptions } from '../eventLabels'

export function getCurrentEventLabel(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): EventLabelOption {
  if (selectedBlock == null) return eventLabelOptions[0]

  const selectedEventLabelType =
    selectedBlock.__typename === 'VideoBlock' && videoActionType === 'complete'
      ? (selectedBlock.endEventLabel ?? 'none')
      : selectedBlock.__typename === 'VideoBlock'
        ? (selectedBlock.eventLabel ?? 'none')
        : 'eventLabel' in selectedBlock
          ? (selectedBlock.eventLabel ?? 'none')
          : 'none'

  return (
    eventLabelOptions.find((option) => option.type === selectedEventLabelType) ??
    eventLabelOptions[0]
  )
}
