import type { TreeBlock } from '@core/journeys/ui/block'

export function findBlocksByTypename<T extends TreeBlock>(
  block: TreeBlock,
  typename: string
): T[] {
  const blocks: T[] = []
  if (block.__typename === typename) {
    blocks.push(block as T)
  }
  for (const child of block.children ?? []) {
    blocks.push(...findBlocksByTypename<T>(child, typename))
  }
  return blocks
}
