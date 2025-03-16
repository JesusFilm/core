import { TreeBlock } from '@core/journeys/ui/block'
import { VideoFields_mediaVideo_Video } from '@core/journeys/ui/Video/__generated__/VideoFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

export function getBackgroundImage(
  card?: TreeBlock<CardBlock>
): string | undefined {
  if (card == null) return

  let bgImage: string | undefined

  const coverBlock = card.children.find(
    (block) =>
      block.id === card.coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  )

  if (coverBlock?.__typename === 'VideoBlock') {
    bgImage =
      (coverBlock.source == VideoBlockSource.internal
        ? // Use posterBlockId image or default poster image on video
          coverBlock?.posterBlockId != null
          ? (
              coverBlock.children.find(
                (block) =>
                  block.id === coverBlock.posterBlockId &&
                  block.__typename === 'ImageBlock'
              ) as TreeBlock<ImageBlock>
            )?.src
          : (coverBlock?.mediaVideo as VideoFields_mediaVideo_Video)
              ?.images?.[0]?.mobileCinematicHigh
        : // Use Youtube or Mux set poster image
          coverBlock?.image) ?? undefined
  } else if (coverBlock?.__typename === 'ImageBlock') {
    bgImage = coverBlock?.src ?? undefined
  }

  return bgImage
}
