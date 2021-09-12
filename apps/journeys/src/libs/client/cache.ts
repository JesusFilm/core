import { InMemoryCache } from '@apollo/client'
import { activeBlockIdVar, treeBlocksVar } from './cache/blocks'

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        activeBlock: {
          read: () => treeBlocksVar().find(({ id }) => id === activeBlockIdVar())
        },
        treeBlocks: {
          read: () => treeBlocksVar()
        }
      }
    }
  }
})
