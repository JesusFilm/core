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
        'NavigateToBlockAction',
        'LinkAction',
        'EmailAction',
        'PhoneAction'
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
        'SpacerBlock',
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
          },
          adminJourney(_, { args, toReference }) {
            if (args?.idType === 'databaseId' && args?.id != null)
              return toReference({
                __typename: 'Journey',
                id: args.id
              })
          }
        }
      },
      Video: {
        keyFields: ['id', 'variant', ['id']]
      },
      Translation: {
        keyFields: ['value']
      },
      VideoDescription: {
        keyFields: ['value']
      },
      VideoImageAlt: {
        keyFields: ['value']
      },
      VideoSnippet: {
        keyFields: ['value']
      },
      VideoStudyQuestion: {
        keyFields: ['value']
      },
      VideoTitle: {
        keyFields: ['value']
      },
      VideoVariantSubtitle: {
        keyFields: ['value']
      },
      LanguageName: {
        keyFields: ['value']
      },
      LinkAction: { keyFields: ['parentBlockId'] },
      EmailAction: { keyFields: ['parentBlockId'] },
      NavigateToBlockAction: { keyFields: ['parentBlockId'] },
      PhoneAction: { keyFields: ['parentBlockId'] }
    }
  })
