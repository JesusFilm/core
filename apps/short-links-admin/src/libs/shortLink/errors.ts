export interface MutationErrorResult {
  __typename?: string
  message?: string | null
  fieldErrors?: Array<{ message: string; path: string[] }> | null
  location?: Array<{
    path?: string[] | null
    value?: string | null
  }> | null
}

export interface ParsedMutationError {
  message: string
  fieldErrors: Record<string, string>
}

export type MutationErrorTypename =
  | 'ZodError'
  | 'NotUniqueError'
  | 'NotFoundError'
  | 'ForeignKeyConstraintError'
  | 'Error'

const ERROR_TYPENAMES: string[] = [
  'ZodError',
  'NotUniqueError',
  'NotFoundError',
  'ForeignKeyConstraintError',
  'Error'
]

/**
 * Narrows a result-union member to its error members (by `__typename`) so the
 * success branch keeps its own type.
 */
export function isMutationError<Result extends { __typename?: string }>(
  result: Result | null | undefined
): result is Extract<Result, { __typename?: MutationErrorTypename }> {
  return (
    result?.__typename != null && ERROR_TYPENAMES.includes(result.__typename)
  )
}

function lastPathSegment(path: string[] | null | undefined): string | null {
  if (path == null || path.length === 0) return null
  return path[path.length - 1]
}

/**
 * Turn a ZodError / NotUniqueError / NotFoundError union member into a general
 * message plus per-field messages keyed by the last path segment (the form
 * field name), so forms can show them inline.
 */
export function parseMutationError(
  result: MutationErrorResult
): ParsedMutationError {
  const fieldErrors: Record<string, string> = {}

  for (const error of result.fieldErrors ?? []) {
    const field = lastPathSegment(error.path)
    if (field != null) fieldErrors[field] = error.message
  }

  if (result.__typename === 'NotUniqueError') {
    for (const location of result.location ?? []) {
      const field = lastPathSegment(location.path)
      if (field != null) fieldErrors[field] = 'Already in use'
    }
  }

  const fallback =
    result.__typename === 'NotUniqueError'
      ? 'That value is already in use'
      : result.__typename === 'NotFoundError'
        ? 'Not found'
        : 'Something went wrong'

  return { message: result.message ?? fallback, fieldErrors }
}
