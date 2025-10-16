import { QueryResult, useQuery } from '@apollo/client'

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

export type GetLanguages = ResultOf<typeof GET_LANGUAGES>
export type GetLanguagesVariables = VariablesOf<typeof GET_LANGUAGES>

export function useLanguagesQuery(
  variables?: GetLanguagesVariables
): QueryResult<GetLanguages, GetLanguagesVariables> {
  const query = useQuery<GetLanguages, GetLanguagesVariables>(GET_LANGUAGES, {
    variables
  })

  return query
}
