import type { TreeBlock } from '@core/journeys/ui/block'

import type { MetaAction } from '../metaActions'
import { metaActions } from '../metaActions'

export function getCurrentAction(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): MetaAction {
  // return (selectedBlock?.metaAction?.__typename as MetaActionType) ?? 'none'
  // TODO: fix logic for finding action of the block
  // once block types are added
  return metaActions[0]
}
