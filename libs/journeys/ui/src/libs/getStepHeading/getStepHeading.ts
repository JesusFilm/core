import findIndex from 'lodash/findIndex'
import { TreeBlock } from '..'
import { TypographyVariant } from '../../../__generated__/globalTypes'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

function getStepNumber(stepId: string, steps: TreeBlock[]): string {
  const index = findIndex(steps, { id: stepId })
  if (index === -1) {
    return 'Untitled'
  } else {
    return `Step ${index + 1}`
  }
}

function typogReducer(previous: TreeBlock, current: TreeBlock): TreeBlock {
  if (current.__typename === 'TypographyBlock') {
    if (previous.__typename === 'TypographyBlock') {
      const previousIndex = orderedTypogVariants.findIndex(
        (variant) => variant === previous.variant
      )
      const currentIndex = orderedTypogVariants.findIndex(
        (variant) => variant === current.variant
      )
      return currentIndex < previousIndex ? current : previous
    } else {
      return current
    }
  } else {
    return previous
  }
}

const orderedTypogVariants: TypographyVariant[] = [
  TypographyVariant.h1,
  TypographyVariant.h2,
  TypographyVariant.h3,
  TypographyVariant.h4,
  TypographyVariant.h5,
  TypographyVariant.h6,
  TypographyVariant.subtitle1,
  TypographyVariant.subtitle2,
  TypographyVariant.body1,
  TypographyVariant.body2,
  TypographyVariant.caption,
  TypographyVariant.overline
]

export function getStepHeading(
  stepId: string,
  children: TreeBlock[],
  steps: TreeBlock[]
): string {
  const descendants = flatten(children)

  const heading =
    descendants.length > 0
      ? descendants.reduce((previousValue, currentValue) =>
          typogReducer(previousValue, currentValue)
        )
      : undefined

  if (heading != null && heading.__typename === 'TypographyBlock') {
    return heading.content
  } else {
    return getStepNumber(stepId, steps)
  }
}
