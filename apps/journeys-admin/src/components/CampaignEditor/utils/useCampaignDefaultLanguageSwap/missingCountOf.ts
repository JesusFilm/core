import { CombinedGraphQLErrors } from '@apollo/client'

/**
 * How many texts still have no translation in the language a refused
 * default-language swap asked for: the API's `CONFLICT` on
 * `defaultLanguageId` carries the count. Undefined for any other error.
 */
export function missingCountOf(error: unknown): number | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined
  const conflict = error.errors.find(
    (graphQLError) =>
      graphQLError.extensions?.code === 'CONFLICT' &&
      graphQLError.extensions?.field === 'defaultLanguageId'
  )
  const count = conflict?.extensions?.count
  return typeof count === 'number' ? count : undefined
}
