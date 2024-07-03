import sortBy from 'lodash/sortBy'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_TypographyBlock as TypographyBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { ORDERED_TYPOGRAPHY_VARIANTS } from '@core/journeys/ui/getStepHeading'
import { getPriorityBlock } from '../getPriorityBlock'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getCardHeadings(
  card: TreeBlock<CardBlock>
): [title?: string, heading?: string] {
  const priorityBlock = getPriorityBlock(card)
  if (priorityBlock?.__typename === 'ImageBlock') {
    const width = priorityBlock?.width
    const height = priorityBlock?.height
    const imageTitle = 'Image'
    const imageSubititle = `${width} x ${height} pixels`
    return [imageTitle, imageSubititle]
  }

  const orderedTypographyVariants =
    ORDERED_TYPOGRAPHY_VARIANTS.slice().reverse()

  const flattenedChildren = flatten(card.children).filter(
    (block) => block.__typename === 'TypographyBlock'
  ) as Array<TreeBlock<TypographyBlock>>

  function getTypographyOrder(block: TreeBlock<TypographyBlock>): number {
    return block.variant != null
      ? orderedTypographyVariants.indexOf(block.variant)
      : orderedTypographyVariants.length
  }

  const [title, subtitle] = sortBy(flattenedChildren, getTypographyOrder)
  return [title?.content, subtitle?.content]
}
