import { TOptions } from 'i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { getStepSubtitle } from '@core/journeys/ui/getStepSubtitle'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { getBackgroundImage } from '../getBackgroundImage'
import { getPriorityBlock } from '../getPriorityBlock/getPriorityBlock'

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

  // if priority block is video
  if (priorityBlock?.__typename === 'VideoBlock') {
    console.log(priorityBlock)
    const title =
      priorityBlock.video !== null
        ? priorityBlock.video.title[0].value
        : undefined
    console.log(priorityBlock)
    const subtitle =
      priorityBlock.startAt !== null && priorityBlock.endAt !== null
        ? secondsToTimeFormat(priorityBlock.startAt, { trimZeroes: true }) +
          '-' +
          secondsToTimeFormat(priorityBlock.endAt, { trimZeroes: true })
        : undefined

    const description = 'English' // priorityBlock.video?.variant !== null ? String(priorityBlock.video?.variant) : undefined

    const bgImage =
      priorityBlock.image !== null ? priorityBlock.image : undefined

    return { title, subtitle, description, priorityBlock, bgImage }
  } else {
    const title = getStepHeading(step.id, step.children, steps, t)
    const subtitle = getStepSubtitle(step.id, step.children, steps, t)
    return { title, subtitle, priorityBlock, bgImage }
  }
}
