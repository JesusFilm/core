import { useQuery } from '@apollo/client/react'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export const GET_LANGUAGES = graphql(`
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
`)

export function useLanguagesQuery(
  variables?: VariablesOf<typeof GET_LANGUAGES>
): useQuery.Result<ResultOf<typeof GET_LANGUAGES>> {
  const query = useQuery(GET_LANGUAGES, {
    variables
  })

  return query
}
