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
  stepId: string | null
  stepChildren: TreeBlock[] | undefined
  steps: TreeBlock[] | undefined
}

export function getStepHeading({
  stepId,
  stepChildren,
  steps
}: GetStepHeadingProps): string {
  if (stepChildren == null) {
    return getStepNumber({ stepId, steps })
  } else {
    const descendants = flatten(stepChildren)
    const heading = descendants.find(
      (block) => block.__typename === 'TypographyBlock'
    ) as TreeBlock<TypographyBlock> | undefined

    if (heading != null) {
      return heading.content
    } else {
      return getStepNumber({ stepId, steps })
    }
  }
}

interface GetStepNumberProps {
  stepId: string | null
  steps: TreeBlock[] | undefined
}

function getStepNumber({ stepId, steps }: GetStepNumberProps): string {
  if (stepId == null) return 'Untitled step'
  const index = findIndex(steps, { id: stepId })
  if (index === -1) {
    return 'Untitled step'
  } else {
    return `Step ${index + 1}`
  }
}
