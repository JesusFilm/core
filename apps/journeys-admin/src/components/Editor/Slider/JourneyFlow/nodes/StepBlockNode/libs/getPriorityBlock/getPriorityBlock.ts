import sortBy from 'lodash/sortBy'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../__generated__/BlockFields'

export function getPriorityBlock(
  card?: TreeBlock<CardBlock>
): TreeBlock | undefined {
  if (card == null) return

  const children = sortBy(
    card.children.filter(({ id }) => card.coverBlockId !== id),
    (block) => {
      switch (block.__typename) {
        case 'VideoBlock':
          return 1
        case 'TextResponseBlock':
          return 2
        case 'FormBlock':
          return 3
        case 'ButtonBlock':
          return 4
        case 'RadioQuestionBlock':
          return 5
        case 'SignUpBlock':
          return 6
        case 'TypographyBlock':
          return 7
        default:
          return 8
      }
    }
  )
  return children[0]
}
