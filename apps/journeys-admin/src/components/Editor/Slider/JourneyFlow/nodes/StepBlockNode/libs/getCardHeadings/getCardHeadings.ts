import sortBy from 'lodash/sortBy'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_TypographyBlock as TypographyBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { ORDERED_TYPOGRAPHY_VARIANTS } from '@core/journeys/ui/getStepHeading'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getCardHeadings(
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
