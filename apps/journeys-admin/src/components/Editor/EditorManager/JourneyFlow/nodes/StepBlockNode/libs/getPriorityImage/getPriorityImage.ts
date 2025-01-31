import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields,
  BlockFields_ImageBlock as ImageBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

export function getPriorityImage(
  cardChildrenBlocks: Array<TreeBlock<BlockFields>>
): string | null | undefined {
  const imageBlock = (
    cardChildrenBlocks.find(
      (block) => block.__typename === 'ImageBlock'
    ) as TreeBlock<ImageBlock>
  )?.src

  return imageBlock
}
