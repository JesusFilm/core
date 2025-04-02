import { TreeBlock } from '../../../../libs/block'

/**
 * Find all TextResponse blocks in the card children
 * @param children - Card children blocks
 * @returns Array of TextResponse blocks
 */
export function getTextResponseBlocks(children: TreeBlock[]): TreeBlock[] {
  return children.filter((block) => block.__typename === 'TextResponseBlock')
}
