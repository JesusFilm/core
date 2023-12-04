import { InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'

export const cache = (): InMemoryCache =>
  new InMemoryCache({
    /* https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
   * The client needs to understand the polymorphic relationship between the
     interfaces and the types that implement it. To inform the client about
     these relationships, we need to pass a possibleTypes option when
     initializing InMemoryCache.
   */
    possibleTypes: {
      Action: [
        'NavigateAction',
        'NavigateToBlockAction',
        'NavigateToJourneyAction',
        'LinkAction',
        'EmailAction'
      ],
      Block: [
        'ButtonBlock',
        'CardBlock',
        'GridContainerBlock',
        'GridItemBlock',
        'IconBlock',
        'ImageBlock',
        'RadioQuestionBlock',
        'RadioOptionBlock',
        'SignUpBlock',
        'StepBlock',
        'TextResponseBlock',
        'TypographyBlock',
        'VideoBlock',
        'VideoTriggerBlock'
      ]
    },
    typePolicies: {
      Query: {
        fields: {
          videos: offsetLimitPagination(['where']),
          searchUnsplashPhotos: {
            keyArgs: ['query'],
            merge(existing, incoming) {
              return {
                ...incoming,
                results: [...(existing?.results ?? []), ...incoming.results]
              }
            }
          },
          listUnsplashCollectionPhotos: {
            keyArgs: ['collectionId'],
            merge(existing, incoming) {
              return [...(existing ?? []), ...incoming]
            }
          }
        }
      },
      Video: {
        keyFields: ['id', 'variant', ['id']]
      }
    }
  })
