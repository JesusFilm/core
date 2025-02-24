import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetLanguagesQuery,
  GetLanguagesQueryVariables
} from './__generated__/useLanguagesQuery'

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID, $where: LanguagesFilter) {
    languages(limit: 5000, where: $where) {
      id
      slug
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

export function useLanguagesQuery(
  variables?: GetLanguagesQueryVariables
): QueryResult<GetLanguagesQuery, GetLanguagesQueryVariables> {
  const query = useQuery<GetLanguagesQuery, GetLanguagesQueryVariables>(
    GET_LANGUAGES,
    {
      variables
    }
  )

  return query
}
