import { ApolloCache } from '@apollo/client'

export function journeyUpdatedAtCacheUpdate(
  cache: ApolloCache<any>,
  journeyId: string
): void {
  if (journeyId != null) {
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journeyId }),
      fields: {
        updatedAt() {
          return new Date().toISOString()
        }
      }
    })
  }
}
