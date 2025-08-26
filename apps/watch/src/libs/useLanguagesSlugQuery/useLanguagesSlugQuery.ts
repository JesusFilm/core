import { QueryHookOptions, QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetLanguagesSlug,
  GetLanguagesSlugVariables
} from '../../../__generated__/GetLanguagesSlug'

export const GET_LANGUAGES_SLUG = gql`
  query GetLanguagesSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguagesWithSlug {
        slug
        language {
          id
          slug
          name {
            value
            primary
          }
        }
      }
    }
  }
`

export function useLanguagesSlugQuery(
  options?: QueryHookOptions<GetLanguagesSlug, GetLanguagesSlugVariables>
): QueryResult<GetLanguagesSlug, GetLanguagesSlugVariables> {
  return useQuery<GetLanguagesSlug, GetLanguagesSlugVariables>(
    GET_LANGUAGES_SLUG,
    options
  )
}
