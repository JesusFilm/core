import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'

export function blockReferencesUpdate(
  blockId: string,
  journey: JourneyFields
): string[] {
  console.log('blockDeleteUpdate ', blockId, journey)

  const stepBlocks = journey.blocks?.filter(
    (block) => block.__typename === 'StepBlock' && block.nextBlockId === blockId
  ) as StepBlock | undefined

  const actionBlocks = journey.blocks?.filter(
    (block) =>
      (block.__typename === 'ButtonBlock' &&
        block?.action?.__typename === 'NavigateToBlockAction' &&
        block?.action?.blockId === blockId) ||
      (block.__typename === 'RadioOptionBlock' &&
        block?.action?.__typename === 'NavigateToBlockAction' &&
        block?.action?.blockId === blockId)
  ) as ButtonBlock | RadioOptionBlock | undefined

  const referencingBlocks = journey.blocks?.filter(
    (block) =>
      (block.__typename === 'StepBlock' && block.nextBlockId === blockId) ||
      (block.__typename === 'ButtonBlock' &&
        block?.action?.__typename === 'NavigateToBlockAction' &&
        block?.action?.blockId === blockId) ||
      (block.__typename === 'RadioOptionBlock' &&
        block?.action?.__typename === 'NavigateToBlockAction' &&
        block?.action?.blockId === blockId)
  )

  console.log('referencingBlocks ', referencingBlocks)

  return referencingBlocks != null
    ? referencingBlocks.map((block) => block.id)
    : []
}
