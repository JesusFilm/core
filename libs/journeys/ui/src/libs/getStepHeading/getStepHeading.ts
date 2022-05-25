import findIndex from 'lodash/findIndex'
import { JourneyFields_blocks_TypographyBlock as TypographyBlock } from '../context/__generated__/JourneyFields'
import { TreeBlock } from '..'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

interface GetStepHeadingProps {
  blockId: string
  children: TreeBlock[] | undefined
  treeBlocks: TreeBlock[]
}

export function getStepHeading({
  blockId,
  children,
  treeBlocks
}: GetStepHeadingProps): string {
  if (children == null) {
    return getStepIndex({ blockId, treeBlocks })
  } else {
    const descendants = flatten(children)
    const heading = descendants.find(
      (block) => block.__typename === 'TypographyBlock'
    ) as TreeBlock<TypographyBlock> | undefined

    if (heading != null) {
      return heading.content
    } else {
      return getStepIndex({ blockId, treeBlocks })
    }
  }
}

interface GetStepIndexProps {
  blockId: string
  treeBlocks: TreeBlock[]
}

function getStepIndex({ blockId, treeBlocks }: GetStepIndexProps): string {
  const index = findIndex(treeBlocks, { id: blockId })
  if (index === -1) {
    return 'Untitled step'
  } else {
    return `Step ${index + 1}`
  }
}
