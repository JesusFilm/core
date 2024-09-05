import { offsetLimitPagination } from '@apollo/client/utilities'
import uniqBy from 'lodash/uniqBy'

interface VideoData {
  __ref: string
  // Add other properties that `existing` might contain
}

export const cache = {
  /* https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
   * The client needs to understand the polymorphic relationship between the
     interfaces and the types that implement it. To inform the client about
     these relationships, we need to pass a possibleTypes option when
     initializing InMemoryCache.
   */
  possibleTypes: {},
  typePolicies: {
    Query: {
      fields: {
        videos: {
          ...offsetLimitPagination([
            'where',
            ['labels', 'availableVariantLanguageIds', 'title']
          ]),
          read(existing, { args }) {
            if (args?.where?.ids?.length > 0) {
              return uniqBy(
                existing
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  ?.filter(({ __ref }) => {
                    return __ref === `Video:${args?.where?.ids[0]}`
                  })
                  ?.slice(
                    args?.offset ?? 0,
                    (args?.offset ?? 0) + (args?.limit ?? 100)
                  ) as VideoData[],
                '__ref'
              )
            }

            return uniqBy(
              existing?.slice(
                args?.offset ?? 0,
                (args?.offset ?? 0) + (args?.limit ?? 100)
              ) as VideoData[],
              '__ref'
            )
          }
        }
      }
    }
  }
}
