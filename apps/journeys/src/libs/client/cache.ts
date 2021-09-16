import { InMemoryCache } from '@apollo/client'
import { activeBlockVar, treeBlocksVar } from './cache/blocks'

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        activeBlock: {
          read: () => activeBlockVar()
        },
        treeBlocks: {
          read: () => treeBlocksVar()
        }
      }
    }
  }
})
