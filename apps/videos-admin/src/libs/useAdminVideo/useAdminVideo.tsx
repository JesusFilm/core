import { QueryHookOptions, QueryResult, useQuery } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const GET_ADMIN_VIDEO = graphql(`
  query GetAdminVideo($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      slug
      label
      published
      images(aspectRatio: banner) {
        id
        mobileCinematicHigh
      }
      imageAlt {
        id
        value
      }
      noIndex
      title {
        id
        value
      }
      description {
        id
        value
      }
      snippet {
        id
        value
      }
      children {
        id
        title {
          id
          value
        }
        images(aspectRatio: banner) {
          id
          mobileCinematicHigh
        }
        imageAlt {
          id
          value
        }
      }
      variants {
        id
        slug
        language {
          id
          name {
            value
          }
          slug
        }
        downloads {
          id
          quality
          size
          height
          width
          url
        }
      }
      studyQuestions {
        id
        value
        primary
      }
      variantLanguagesCount
      subtitles {
        id
        edition
        vttSrc
        srtSrc
        value
        language {
          id
          name {
            value
          }
          slug
        }
      }
    }
  }
`)

export type GetAdminVideo = ResultOf<typeof GET_ADMIN_VIDEO>
export type GetAdminVideoVariables = VariablesOf<typeof GET_ADMIN_VIDEO>

export function useAdminVideo(
  options: QueryHookOptions<GetAdminVideo, GetAdminVideoVariables>
): QueryResult<GetAdminVideo, GetAdminVideoVariables> {
  const query = useQuery<GetAdminVideo, GetAdminVideoVariables>(
    GET_ADMIN_VIDEO,
    options
  )
  return query
}
