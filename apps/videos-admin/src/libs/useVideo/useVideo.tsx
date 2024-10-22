import { QueryHookOptions, QueryResult, useQuery } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const GET_VIDEO = graphql(`
  query GetVideo($videoId: ID!) {
    video(id: $videoId) {
      id
      slug
      image
      images(aspectRatio: banner) {
        mobileCinematicHigh
      }
      imageAlt {
        id
        value
      }
      title {
        id
        value
      }
      description {
        value
        id
      }
      label
      variantLanguagesCount
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
      }
      studyQuestions {
        id
        value
      }
    }
  }
`)

export type GetVideo = ResultOf<typeof GET_VIDEO>
export type GetVideoVariables = VariablesOf<typeof GET_VIDEO>

export function useVideo(
  options: QueryHookOptions<GetVideo, GetVideoVariables>
): QueryResult<GetVideo, GetVideoVariables> {
  const query = useQuery<GetVideo, GetVideoVariables>(GET_VIDEO, options)
  return query
}
