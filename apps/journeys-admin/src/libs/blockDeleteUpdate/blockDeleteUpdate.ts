import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../__generated__/BlockFields'

interface BlockIdentifier {
  __typename: TreeBlock['__typename']
  id: string
  children?: BlockIdentifier[]
}

interface BlockDeleteResponse {
  deletedBlocks:
    | Array<BlockIdentifier & { parentOrder: number | null }>
    | undefined
  updatedBlocks: Array<StepBlock | ButtonBlock | RadioOptionBlock> | undefined
}

const getNestedChildRefs = (
  block: BlockIdentifier,
  results: string[] = []
): string[] => {
  results.push(`${block.__typename}:${block.id}`)
  block.children?.forEach((child) => getNestedChildRefs(child, results))
  return results
}

export const blockDeleteUpdate = (
  selectedBlock: BlockIdentifier,
  response: BlockDeleteResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: ApolloCache<any>,
  journeyId: string
): void => {
  console.log('blockDeleteUpdate ', selectedBlock, response, journeyId)

  const { deletedBlocks, updatedBlocks } = response

  if (deletedBlocks != null) {
    deletedBlocks.forEach((block) => {
      cache.modify({
        id: cache.identify({
          __typename: block.__typename,
          id: block.id
        }),
        fields: {
          parentOrder() {
            return block.parentOrder
          }
        }
      })
    })
    const blockRefs = getNestedChildRefs(selectedBlock)
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journeyId }),
      fields: {
        blocks(existingBlockRefs: Reference[]) {
          return reject(existingBlockRefs, (block) => {
            return blockRefs.includes(block.__ref)
          })
        }
      }
    })
    if (selectedBlock.__typename === 'StepBlock') {
      cache.modify({
        fields: {
          blocks(existingBlockRefs = []) {
            return existingBlockRefs.filter(
              (blockRef) => blockRef.__ref !== `StepBlock:${selectedBlock.id}`
            )
          }
        }
      })
    }
    blockRefs.forEach((blockRef) => {
      cache.evict({
        id: blockRef
      })
    })

    // cache.gc() // Run garbage collection to clean up the cache
  }

  if (updatedBlocks != null) {
    // Handle cache update for updated blocks (restore null references)
    updatedBlocks.forEach((block) => {
      if (block.__typename === 'StepBlock') {
        cache.modify({
          id: cache.identify({
            __typename: block.__typename,
            id: block.id
          }),
          fields: {
            nextBlockId: () => block.nextBlockId
          }
        })
      }

      if (
        block.__typename === 'ButtonBlock' ||
        block.__typename === 'RadioOptionBlock'
      ) {
        cache.modify({
          id: cache.identify({
            __typename: block.__typename,
            id: block.id
          }),
          fields: {
            action: () => block.action
          }
        })
      }
    })
  }
}
