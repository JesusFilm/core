import { ApolloCache, Reference, gql } from '@apollo/client'
import { BlockRestore } from '../../../../../__generated__/BlockRestore'

export function blockRestoreCacheUpdate(
  cache: ApolloCache<any>,
  data: BlockRestore,
  id?
) {
  const defaultCacheOptions = {
    fields: {
      blocks(existingBlockRefs: Reference[] = [], { readField }) {
        data.blockRestore.forEach((block) => {
          const newBlockRef = cache.writeFragment({
            data: block,
            fragment: gql`
                  fragment RestoredBlock on Block {
                    id
                  }
                `
          })
          if (
            existingBlockRefs.some((ref) => readField('id', ref) === block?.id)
          ) {
            return existingBlockRefs
          }
          return [...existingBlockRefs, newBlockRef]
        })
      }
    }
  }
  const cacheOptions =
    id != null ? { ...defaultCacheOptions, id } : defaultCacheOptions
  cache.modify(cacheOptions)
}
