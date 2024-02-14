import { TOptions } from 'i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { getBackgroundImage } from '../getBackgroundImage'
import { getPriorityBlock } from '../getPriorityBlock'
import { getStepHeadings } from '../getStepHeadings'

interface CardMetadata {
  title?: string
  subtitle?: string
  description?: string
  priorityBlock?: TreeBlock
  bgImage?: string
}

export function getCardMetadata(
  card: TreeBlock<BlockFields_CardBlock> | undefined,
  steps: Array<TreeBlock<StepBlock>>,
  step: TreeBlock<StepBlock>,
  t: (str: string, options?: TOptions) => string
): CardMetadata {
  if (card == null) return {}

  const priorityBlock = getPriorityBlock(card)
  const bgImage = getBackgroundImage(card)

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
    const [title, subtitle] = getStepHeadings(step.children)
    return { title, subtitle, priorityBlock, bgImage }
  }
}
