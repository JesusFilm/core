import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields,
  BlockFields_ImageBlock as ImageBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

export function getPriorityImage(
  card: Array<TreeBlock<BlockFields>>
): string | undefined {
  if (card == null) return

  const imageBlock =
    card != null
      ? (
          card.find(
            (block) => block.__typename === 'ImageBlock'
          ) as TreeBlock<ImageBlock>
        )?.src
      : undefined

  return imageBlock != null ? imageBlock : undefined
}
