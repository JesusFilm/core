import { TOptions } from 'i18next'
import findIndex from 'lodash/findIndex'

import { TypographyVariant } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../block'
import { BlockFields_TypographyBlock as TypographyBlock } from '../block/__generated__/BlockFields'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

function getStepNumber(
  stepId: string,
  steps: TreeBlock[],
  t: (str: string, options?: TOptions) => string
): string {
  const index = findIndex(steps, { id: stepId })
  if (index === -1) {
    return t('Untitled')
  } else {
    return t('Step {{number}}', { number: index + 1 })
  }
}

function findMostImportantTypographyBlock(
  previous: TreeBlock<TypographyBlock> | null,
  current: TreeBlock
): TreeBlock<TypographyBlock> | null {
  if (current.__typename !== 'TypographyBlock') return previous
  if (previous === null) return current

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
  t: (str: string, options?: TOptions) => string
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
