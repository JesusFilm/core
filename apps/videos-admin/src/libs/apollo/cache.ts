import { offsetLimitPagination } from '@apollo/client/utilities'

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
            // A read function should always return undefined if existing is
            // undefined. Returning undefined signals that the field is
            // missing from the cache, which instructs Apollo Client to
            // fetch its value from your GraphQL server.
            return existing?.slice(
              args?.offset ?? 0,
              (args?.offset ?? 0) + (args?.limit ?? 100)
            ) as VideoData[]
          }
        },
        adminVideos: {
          ...offsetLimitPagination(['where']),
          read(existing, { args }) {
            // A read function should always return undefined if existing is
            // undefined. Returning undefined signals that the field is
            // missing from the cache, which instructs Apollo Client to
            // fetch its value from your GraphQL server.
            return existing?.slice(
              args?.offset ?? 0,
              (args?.offset ?? 0) + (args?.limit ?? 100)
            ) as VideoData[]
          }
        },
        // Always fetch the video from the network
        adminVideo: {
          read(_, { args, toReference }) {
            if (args?.id != null) {
              return toReference({
                __typename: 'AdminVideo',
                id: args.id
              })
            }
          }
        }
      }
    },
    AdminVideo: {
      fields: {
        studyQuestions: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming)
          }
        },
        images: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming)
          }
        }
      }
    },
    // Set proper identification for VideoStudyQuestion objects
    VideoStudyQuestion: {
      keyFields: ['id']
    }
  }
}
