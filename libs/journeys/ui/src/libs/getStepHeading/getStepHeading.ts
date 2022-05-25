import findIndex from 'lodash/findIndex'
import { JourneyFields_blocks_TypographyBlock as TypographyBlock } from '../context/__generated__/JourneyFields'
import { TreeBlock } from '..'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getStepHeading(
  stepId: string,
  stepChildren: TreeBlock[],
  steps: TreeBlock[]
): string {
  if (stepChildren == null) {
    return getStepNumber(stepId, steps)
  } else {
    const descendants = flatten(stepChildren)
    const heading = descendants.find(
      (block) => block.__typename === 'TypographyBlock'
    ) as TreeBlock<TypographyBlock> | undefined

    if (heading != null) {
      return heading.content
    } else {
      return getStepNumber(stepId, steps)
    }
  }
}

function getStepNumber(stepId: string, steps: TreeBlock[]): string {
  if (stepId == null) return 'Untitled'
  const index = findIndex(steps, { id: stepId })
  if (index === -1) {
    return 'Untitled'
  } else {
    return `Step ${index + 1}`
  }
}
