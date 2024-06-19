import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks as Block } from '../../../__generated__/GetJourney'

const getNestedChildRefs = (
  block: TreeBlock<Block> | Block,
  results: string[] = []
): string[] => {
  results.push(`${block.__typename}:${block.id}`)
  ;(block as TreeBlock<Block>).children?.forEach((child) => {
    results = getNestedChildRefs(child, results)
  })
  return results
}

export const blockDeleteUpdate = (
  selectedBlock: TreeBlock<Block> | Block,
  response,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  cache: ApolloCache<any>,
  journeyId: string
): void => {
  if (response != null) {
    response.forEach((block) => {
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
  }
}
