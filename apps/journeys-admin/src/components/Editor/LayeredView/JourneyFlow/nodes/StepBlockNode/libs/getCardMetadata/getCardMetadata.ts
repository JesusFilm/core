import { TreeBlock } from '@core/journeys/ui/block'
import { isActionBlock } from '@core/journeys/ui/isActionBlock'
import {
  VideoFields_mediaVideo_Video,
  VideoFields_mediaVideo_Video_variantLanguages
} from '@core/journeys/ui/Video/__generated__/VideoFields'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { getBackgroundImage } from '../getBackgroundImage'
import { getCardHeadings } from '../getCardHeadings'
import { getPriorityBlock } from '../getPriorityBlock'
import { getPriorityImage } from '../getPriorityImage'

interface CardMetadata {
  title?: string
  subtitle?: string
  description?: string
  priorityBlock?: TreeBlock
  bgImage?: string
  hasMultipleActions?: boolean
  priorityImage?: string | null
}

function getVideoVariantLanguage(
  selectedLanguageId,
  languages?: VideoFields_mediaVideo_Video_variantLanguages[]
): string | undefined {
  if (languages == null) return

  const language = languages.find(
    (language) => language.id === selectedLanguageId
  )

  if (language != null) {
    const local = language.name?.find(({ primary }) => !primary)?.value
    const native = language.name?.find(({ primary }) => primary)?.value

    return local ?? native
  }
}

function getVideoDescription(videoBlock: VideoBlock): string {
  return (
    {
      [VideoBlockSource.internal]: getVideoVariantLanguage(
        videoBlock.videoVariantLanguageId,
        (videoBlock.mediaVideo as VideoFields_mediaVideo_Video)
          ?.variantLanguages
      ),
      [VideoBlockSource.youTube]: 'YouTube Media',
      [VideoBlockSource.mux]: 'Uploaded Media'
    }[videoBlock.source] ?? 'Internal Media'
  )
}

export function getCardMetadata(
  card: TreeBlock<CardBlock> | undefined
): CardMetadata {
  if (card == null) return {}
  const priorityBlock = getPriorityBlock(card)

  const hasMultipleActions =
    card.children
      .flatMap((block) =>
        block.__typename === 'RadioQuestionBlock' ? block.children : block
      )
      .filter((child) => card.coverBlockId !== child.id && isActionBlock(child))
      .length > 1

  if (priorityBlock?.__typename === 'VideoBlock') {
    const title =
      priorityBlock.mediaVideo?.__typename === 'Video'
        ? priorityBlock.mediaVideo?.title?.[0]?.value
        : (priorityBlock.title ?? undefined)
    const subtitle =
      priorityBlock.startAt !== null && priorityBlock.endAt !== null
        ? `${secondsToTimeFormat(priorityBlock.startAt, {
            trimZeroes: true
          })}-${secondsToTimeFormat(priorityBlock.endAt, { trimZeroes: true })}`
        : undefined

    const description = getVideoDescription(priorityBlock)

    const posterBlockImage =
      priorityBlock?.posterBlockId != null
        ? (
            priorityBlock.children.find(
              (block) =>
                block.id === priorityBlock.posterBlockId &&
                block.__typename === 'ImageBlock'
            ) as TreeBlock<ImageBlock>
          )?.src
        : undefined

    const bgImage =
      // Use posterBlockId image or default poster image on video
      posterBlockImage ??
      (priorityBlock?.mediaVideo?.__typename === 'Video'
        ? (priorityBlock?.mediaVideo?.images[0]?.mobileCinematicHigh as string)
        : (priorityBlock.image ?? undefined))

    return {
      description,
      title,
      subtitle,
      priorityBlock,
      bgImage,
      hasMultipleActions
    }
  }

  let imageTitle
  let imageSubititle

  if (priorityBlock?.__typename === 'ImageBlock') {
    const width = priorityBlock.width
    const height = priorityBlock.height
    imageTitle = 'Image'
    imageSubititle = `${width} x ${height} pixels`
  }

  const [title, subtitle] = getCardHeadings(card.children)
  const bgImage = getBackgroundImage(card)
  const priorityImage = getPriorityImage(card.children)

  return {
    title: imageTitle ?? title,
    subtitle: imageSubititle ?? subtitle,
    priorityBlock,
    bgImage,
    hasMultipleActions,
    priorityImage
  }
}
