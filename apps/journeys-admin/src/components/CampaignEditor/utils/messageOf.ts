import { CombinedGraphQLErrors } from '@apollo/client'

/** The API's message, verbatim, from a failed mutation (PRD §15). */
export function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : String(error)
}
