import { TreeBlock } from '../../../../libs/block'
import type { BlockFields } from '../../../../libs/block/blockFields'
type TextResponseBlock = Extract<
  BlockFields,
  { __typename: 'TextResponseBlock' }
>

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
