import { TreeBlock } from '@core/journeys/ui/block'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { BlockFields_CardBlock } from '../../../../../../../__generated__/BlockFields'
import { getBackgroundImage } from '../getBackgroundImage'
import { getCardHeadings } from '../getCardHeadings'
import { getPriorityBlock } from '../getPriorityBlock'

interface CardMetadata {
  title?: string
  subtitle?: string
  description?: string
  priorityBlock?: TreeBlock
  bgImage?: string
}

export function getCardMetadata(
  card: TreeBlock<BlockFields_CardBlock> | undefined
): CardMetadata {
  if (card == null) return {}

  const priorityBlock = getPriorityBlock(card)

  if (priorityBlock?.__typename === 'VideoBlock') {
    const title =
      priorityBlock.video !== null
        ? priorityBlock.video.title[0].value
        : undefined
    const subtitle =
      priorityBlock.startAt !== null && priorityBlock.endAt !== null
        ? secondsToTimeFormat(priorityBlock.startAt, { trimZeroes: true }) +
          '-' +
          secondsToTimeFormat(priorityBlock.endAt, { trimZeroes: true })
        : undefined
    const bgImage =
      priorityBlock.video?.image !== null
        ? priorityBlock.video?.image
        : undefined

    return { title, subtitle, priorityBlock, bgImage }
  } else {
    const [title, subtitle] = getCardHeadings(card.children)
    const bgImage = getBackgroundImage(card)

    return { title, subtitle, priorityBlock, bgImage }
  }
}
