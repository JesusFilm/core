import findIndex from 'lodash/findIndex'
import { TreeBlock } from '..'
import { TypographyVariant } from '../../../__generated__/globalTypes'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

function getStepNumber(
  stepId: string,
  steps: TreeBlock[],
  t: (stringToTranslate: string) => string
): string {
  const index = findIndex(steps, { id: stepId })
  if (index === -1) {
    return t('Untitled')
  } else {
    return `${t('Step')} ${index + 1}`
  }
}

function findMostImportantTypographyBlock(
  previous: TreeBlock | null,
  current: TreeBlock
): TreeBlock {
  if (previous == null || previous.__typename !== 'TypographyBlock')
    return current
  if (current.__typename !== 'TypographyBlock') return previous

  const previousIndex = orderedVariants.findIndex(
    (variant) => variant === previous.variant
  )
  const currentIndex = orderedVariants.findIndex(
    (variant) => variant === current.variant
  )
  return currentIndex > previousIndex ? current : previous
}

const orderedVariants: TypographyVariant[] = [
  TypographyVariant.overline,
  TypographyVariant.caption,
  TypographyVariant.body2,
  TypographyVariant.body1,
  TypographyVariant.subtitle2,
  TypographyVariant.subtitle1,
  TypographyVariant.h6,
  TypographyVariant.h5,
  TypographyVariant.h4,
  TypographyVariant.h3,
  TypographyVariant.h2,
  TypographyVariant.h1
]

export function getStepHeading(
  stepId: string,
  children: TreeBlock[],
  steps: TreeBlock[],
  t: (stringToTranslate: string) => string
): string {
  const descendants = flatten(children)

  const heading =
    descendants.length > 0
      ? descendants.reduce(findMostImportantTypographyBlock, null)
      : undefined

  if (heading != null && heading.__typename === 'TypographyBlock') {
    return heading.content
  } else {
    return getStepNumber(stepId, steps, t)
  }
}
