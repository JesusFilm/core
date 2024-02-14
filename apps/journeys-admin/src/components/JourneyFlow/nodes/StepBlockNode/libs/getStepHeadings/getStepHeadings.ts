import sortBy from 'lodash/sortBy'

import { TreeBlock } from '@core/journeys/ui/block'
import { ORDERED_TYPOGRAPHY_VARIANTS } from '@core/journeys/ui/getStepHeading'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/BlockFields'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getStepHeadings(
  children: TreeBlock[]
): [title?: string, heading?: string] {
  const orderedTypographyVariants =
    ORDERED_TYPOGRAPHY_VARIANTS.slice().reverse()
  const [title, subtitle] = sortBy(
    flatten(children).filter(
      (block) => block.__typename === 'TypographyBlock'
    ) as Array<TreeBlock<TypographyBlock>>,
    (block) =>
      block.variant != null
        ? orderedTypographyVariants.indexOf(block.variant)
        : orderedTypographyVariants.length
  )
  return [title?.content, subtitle?.content]
}
