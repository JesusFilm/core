import { gql } from '@apollo/client'

import {
  JourneyFields,
  JourneyFields_blocks
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'

export const BLOCK_DELETE_REFERENCES = gql`
  mutation BlockDeleteReferences($id: ID!) {
    blockDeleteReferences(id: $id) {
      id
      ... on StepBlock {
        nextBlockId
      }
      ... on ButtonBlock {
        action {
          ... on NavigateToBlockAction {
            blockId
          }
        }
      }
      ... on RadioOptionBlock {
        action {
          ... on NavigateToBlockAction {
            blockId
          }
        }
      }
    }
  }
`

export function blockReferencesUpdate(
  blockId: string,
  journey: JourneyFields
): JourneyFields_blocks[] {
  console.log('blockDeleteUpdate ', blockId, journey)
  console.log('searching journey.blocks ', journey.blocks)

  const stepBlocks =
    journey.blocks?.filter(
      (block) =>
        block.__typename === 'StepBlock' && block.nextBlockId === blockId
    ) ?? []

  const updatedStepBlocks = stepBlocks.map((block) => ({
    ...block,
    nextBlockId: null
  }))

  // // TODO(jk)
  // // should use isActionBlock!
  // const actionBlocks =
  //   journey.blocks?.filter(
  //     (block) =>
  //       (block.__typename === 'ButtonBlock' &&
  //         block?.action?.__typename === 'NavigateToBlockAction' &&
  //         block?.action?.blockId === blockId) ||
  //       (block.__typename === 'RadioOptionBlock' &&
  //         block?.action?.__typename === 'NavigateToBlockAction' &&
  //         block?.action?.blockId === blockId)
  //   ) ?? []

  // const updatedActionBlocks = actionBlocks.map((block) => ({
  //   ...block,
  //   action: {
  //     ...block.action,
  //     blockId: null
  //   }
  // }))

  // const referencingBlocks = journey.blocks?.filter(
  //   (block) =>
  //     (block.__typename === 'StepBlock' && block.nextBlockId === blockId) ||
  //     (block.__typename === 'ButtonBlock' &&
  //       block?.action?.__typename === 'NavigateToBlockAction' &&
  //       block?.action?.blockId === blockId) ||
  //     (block.__typename === 'RadioOptionBlock' &&
  //       block?.action?.__typename === 'NavigateToBlockAction' &&
  //       block?.action?.blockId === blockId)
  // )

  // console.log('updatedStepBlocks ', updatedStepBlocks)

  return updatedStepBlocks ?? []
}
