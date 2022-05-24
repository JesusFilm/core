import { JourneyFields_blocks_TypographyBlock as TypographyBlock } from '../context/__generated__/JourneyFields'
import { TreeBlock } from '..'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getStepHeading(children: TreeBlock[]): string | undefined {
  const descendants = flatten(children)
  const heading = descendants.find(
    (block) => block.__typename === 'TypographyBlock'
  ) as TreeBlock<TypographyBlock> | undefined

  return heading?.content
}
