import { ApolloCache, gql } from '@apollo/client'

import { BlockFields } from '../../../../../__generated__/BlockFields'

export function blockCreateUpdate(
  // apollo gives any type to ApolloCache generic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: ApolloCache<any>,
  journeyId: string | undefined,
  data: { id: string; __typename: BlockFields['__typename'] } | undefined | null
): void {
  if (journeyId == null || data == null) return
  cache.modify({
    id: cache.identify({ __typename: 'Journey', id: journeyId }),
    fields: {
      blocks(existingBlocksRefs = []) {
        const newBlockRef = cache.writeFragment({
          data,
          fragment: gql`
            fragment NewBlock on Block {
              id
            }
          `
        })
        return [...existingBlocksRefs, newBlockRef]
      }
    }
  })
}
