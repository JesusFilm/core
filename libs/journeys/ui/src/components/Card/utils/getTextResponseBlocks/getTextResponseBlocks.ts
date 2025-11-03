import { TreeBlock } from '../../../../libs/block'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../libs/block/__generated__/BlockFields'

/**
 * Find all TextResponse blocks in the card children
 * @param children - Card children blocks
 * @returns Array of TextResponse blocks
 */

export function getTextResponseBlocks(
  children: TreeBlock[]
): TreeBlock<TextResponseBlock>[] {
  return children.filter(
    (block): block is TreeBlock<TextResponseBlock> =>
      block.__typename === 'TextResponseBlock'
  )
}
