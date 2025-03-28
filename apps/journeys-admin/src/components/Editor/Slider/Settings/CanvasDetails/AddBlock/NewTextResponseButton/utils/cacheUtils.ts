import { ApolloCache, Reference, gql } from '@apollo/client'

const NEW_BLOCK_FRAGMENT = gql`
  fragment NewBlock on Block {
    id
  }
`

/**
 * Adds new blocks to the journey's block list in the Apollo cache.
 * Filters out buttonUpdate operation since it's an update to an existing block
 * rather than a new block creation.
 */
export const addBlocksToCache = (
  cache: ApolloCache<any>,
  journeyId: string,
  data: Record<string, any>
): void => {
  if (data == null) return

  cache.modify({
    id: cache.identify({ __typename: 'Journey', id: journeyId }),
    fields: {
      blocks(existingBlockRefs = []) {
        const keys = Object.keys(data).filter((key) => key !== 'buttonUpdate')
        return [
          ...existingBlockRefs,
          ...keys.map((key) =>
            cache.writeFragment({
              data: data[key],
              fragment: NEW_BLOCK_FRAGMENT
            })
          )
        ]
      }
    }
  })
}

/**
 * Removes specified blocks from the journey's block list in the Apollo cache.
 * Also evicts the blocks from the cache entirely and performs garbage collection.
 */
export const removeBlocksFromCache = (
  cache: ApolloCache<any>,
  journeyId: string,
  blocks: Array<{ id: string; __typename: string }>
): void => {
  blocks.forEach((block) => {
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journeyId }),
      fields: {
        blocks(existingBlockRefs: Reference[], { readField }) {
          return existingBlockRefs.filter(
            (ref) => readField('id', ref) !== block.id
          )
        }
      }
    })
    cache.evict({
      id: cache.identify({
        __typename: block.__typename,
        id: block.id
      })
    })
    cache.gc()
  })
}

/**
 * Restores previously deleted blocks to the journey's block list in the Apollo cache.
 * Checks for existing blocks to prevent duplicates during restoration.
 */
export const restoreBlocksToCache = (
  cache: ApolloCache<any>,
  journeyId: string,
  data: Record<string, any[]>
): void => {
  if (data == null) return
  const keys = Object.keys(data)
  keys.forEach((key) => {
    data[key].forEach((block) => {
      cache.modify({
        id: cache.identify({ __typename: 'Journey', id: journeyId }),
        fields: {
          blocks(existingBlockRefs: Reference[], { readField }) {
            if (
              existingBlockRefs.some((ref) => readField('id', ref) === block.id)
            ) {
              return existingBlockRefs
            }
            return [
              ...existingBlockRefs,
              cache.writeFragment({
                data: block,
                fragment: NEW_BLOCK_FRAGMENT
              })
            ]
          }
        }
      })
    })
  })
}
