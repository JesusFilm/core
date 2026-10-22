import { GraphQLError } from 'graphql'

/** The target does not resolve, or the caller may not see it (GLOSSARY.md: Campaign access). */
export function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

/** The target resolves but the caller is not allowed to act on it (GLOSSARY.md: Campaign access). */
export function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

/**
 * A well-formed request refused by the current state; `extensions` carries
 * whatever else the caller needs to act on it (a count, say).
 */
export function conflict(
  message: string,
  field: string,
  extensions: Record<string, unknown> = {}
): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT', field, ...extensions }
  })
}

/**
 * Every campaign mutation validates its input before Prisma and throws this
 * with the offending column as `field`, so the editor can show the message
 * verbatim.
 */
export function badUserInput(message: string, field: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', field }
  })
}
