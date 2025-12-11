import { graphql } from '@core/shared/gql'

export const GET_PLAYLIST = graphql(`
  query GetPlaylist($id: ID!, $idType: IdType!) {
    playlist(id: $id, idType: $idType) {
      ... on QueryPlaylistSuccess {
        data {
          id
          name
          owner {
            id
            firstName
            lastName
          }
          items {
            id
            order
            videoVariant {
              id
              hls
              duration
              language {
                id
                name {
                  value
                }
              }
              video {
                id
                title {
                  value
                }
                description {
                  value
                  primary
                }
                studyQuestions {
                  value
                  primary
                }
                images {
                  mobileCinematicHigh
                }
              }
            }
          }
        }
      }
      ... on NotFoundError {
        message
        location {
          path
          value
        }
      }
    }
  }
`)
