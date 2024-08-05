import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

import type { TreeBlock } from '@core/journeys/ui/block'

interface BlockIdentifier {
  __typename: TreeBlock['__typename']
  id: string
  children?: BlockIdentifier[]
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
  response: Array<BlockIdentifier & { parentOrder: number | null }> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
