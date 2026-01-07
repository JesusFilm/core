import type { TreeBlock } from '@core/journeys/ui/block'

import type { MetaAction } from '../metaActions'
import { metaActions } from '../metaActions'

export function getCurrentAction(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): MetaAction {
  if (selectedBlock == null) return metaActions[0]

  const selectedActionType =
    selectedBlock.__typename === 'VideoBlock' && videoActionType === 'complete'
      ? (selectedBlock.endEventLabel ?? 'none')
      : selectedBlock.__typename === 'VideoBlock'
        ? (selectedBlock.eventLabel ?? 'none')
        : 'eventLabel' in selectedBlock
          ? (selectedBlock.eventLabel ?? 'none')
          : 'none'

  return (
    metaActions.find((action) => action.type === selectedActionType) ??
    metaActions[0]
  )
}
