import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetLanguages,
  GetLanguagesVariables
} from './__generated__/GetLanguages'

export const GET_LANGUAGES = gql`
  query GetLanguages(
    $languageId: ID
    $where: LanguagesFilter = { hasVideos: true }
  ) {
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
  variables?: GetLanguagesVariables
): QueryResult<GetLanguages, GetLanguagesVariables> {
  const query = useQuery<GetLanguages, GetLanguagesVariables>(GET_LANGUAGES, {
    variables: {
      ...variables,
      where: {
        hasVideos: true,
        ...variables?.where
      }
    }
  })

  return query
}
