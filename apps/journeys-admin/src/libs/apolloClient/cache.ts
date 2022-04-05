import { InMemoryCache } from '@apollo/client'

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
        'LinkAction'
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
        'TypographyBlock',
        'VideoBlock',
        'VideoTriggerBlock'
      ]
    },
    typePolicies: {
      Query: {
        fields: {
          videos: {
            keyArgs: ['where'],
            merge(existing, incoming, { args }) {
              // Slicing is necessary because the existing data is
              // immutable, and frozen in development.
              const merged = existing != null ? existing.slice(0) : []
              for (let i = 0; i < incoming.length; ++i) {
                merged[((args?.offset as number) ?? 0) + i] = incoming[i]
              }
              return merged
            }
          }
        }
      }
    }
  })
