import { ApolloCache } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'
import { reject } from 'lodash'

import { GetJourney_journey_blocks as Block } from '../../../__generated__/GetJourney'

const getNestedChildRefs = (
  block: TreeBlock<Block>,
  results: string[] = []
): string[] => {
  results.push(`${block.__typename}:${block.id}`)
  block.children.forEach((child) => {
    results = getNestedChildRefs(child, results)
  })
  return results
}

export const blockDeleteUpdate = (
  selectedBlock: TreeBlock<Block>,
  response,
  cache: ApolloCache<any>, // eslint-disable-line
  journeyId: string
): void => {
  if (response != null) {
    console.log(response)
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
        blocks(existingBlockRefs = []) {
          return reject(existingBlockRefs, (block) => {
            return blockRefs.includes(block.__ref)
          })
        }
      }
    })
    blockRefs.forEach((blockRef) => {
      cache.evict({
        id: blockRef
      })
    })
  }
}
