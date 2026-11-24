import { CombinedGraphQLErrors } from '@apollo/client'

/**
 * The API's message, verbatim, from a failed mutation: the GraphQL message,
 * else the `Error`'s message, else the `fallback`, else `String(error)`.
 */
export function messageOf(error: unknown, fallback?: string): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  if (error instanceof Error) return error.message
  return fallback ?? String(error)
}
