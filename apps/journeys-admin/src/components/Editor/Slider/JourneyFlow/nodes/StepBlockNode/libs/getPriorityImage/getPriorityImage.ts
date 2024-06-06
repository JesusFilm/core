import sortBy from 'lodash/sortBy'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields } from '@core/journeys/ui/block/__generated__/BlockFields'

export function getPriorityImage(
  card: TreeBlock<BlockFields>
): string | undefined {
  if (card == null) return

  const imageBlock = sortBy(card.children, (block) => {
    if (block.__typename === 'ImageBlock') {
      block.__typename = 'ImageBlock'
      return block.src
    }
    return Infinity
  }).find((block) => block.__typename === 'ImageBlock')

  return imageBlock
}
