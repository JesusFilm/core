import { TreeBlock } from '../../../../libs/block'
import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../libs/block/__generated__/BlockFields'

/**
 * Find all Multiselect blocks in the card children
 * @param children - Card children blocks
 * @returns Array of Multiselect blocks
 */

export function getMultiselectBlocks(
  children: TreeBlock[]
): TreeBlock<MultiselectBlock>[] {
  return children.filter(
    (block): block is TreeBlock<MultiselectBlock> =>
      block.__typename === 'MultiselectBlock'
  )
}
