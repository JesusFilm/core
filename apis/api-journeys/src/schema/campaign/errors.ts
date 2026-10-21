import { GraphQLError } from 'graphql'

/** The target does not resolve, or the caller may not see it (PRD §15). */
export function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

/** The target resolves but the caller is not allowed to act on it (PRD §15). */
export function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

/** A well-formed request refused by the current state (PRD §15). */
export function conflict(message: string, field: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT', field }
  })
}
