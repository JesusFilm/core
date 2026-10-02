import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'

/**
 * Build the same ZodError shape the Pothos zod plugin produces, so resolver
 * side validation (which needs data the input validators cannot see, such as
 * the domain's slug grammar) surfaces through the existing `ZodError` member
 * of the mutation result unions.
 */
export function inputValidationError(
  path: string[],
  message: string
): ZodError {
  return new ZodError([{ code: 'custom', path, message, input: undefined }])
}

export const HTTPS_URL_MESSAGE = 'must be an https URL'

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export const REDIRECT_STATUSES = [301, 302, 307, 308]
export const REDIRECT_STATUS_MESSAGE = 'must be one of 301, 302, 307, 308'

export function isRedirectStatus(value: number): boolean {
  return REDIRECT_STATUSES.includes(value)
}

/**
 * The request is well formed but the domain is not in a state that allows it
 * (remove the KV setup before deleting, set KV up before attaching, ...).
 */
export function failedPrecondition(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'FAILED_PRECONDITION' }
  })
}
