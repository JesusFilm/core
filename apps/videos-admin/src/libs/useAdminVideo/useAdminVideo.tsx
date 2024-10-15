import { QueryHookOptions, QueryResult, useQuery } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const GET_ADMIN_VIDEO = graphql(`
  query GetAdminVideo($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
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
      published
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
