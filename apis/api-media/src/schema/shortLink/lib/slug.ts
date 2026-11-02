/**
 * Slug grammar for short link pathnames, driven by the domain's settings
 * (`slugAllowedChars`, `slugMinLength`, `slugMaxLength`, `slugCaseSensitive`,
 * `reservedPaths`). The edge Worker applies the same rules when it looks a
 * path up, so a pathname that passes here is one the Worker will serve.
 */

export interface SlugGrammar {
  slugAllowedChars: string
  slugMinLength: number
  slugMaxLength: number
  slugCaseSensitive: boolean
  reservedPaths: string[]
}

export type SlugValidationError =
  | { code: 'invalidGrammar'; message: string }
  | { code: 'invalidCharacters'; message: string }
  | { code: 'tooShort'; message: string }
  | { code: 'tooLong'; message: string }
  | { code: 'reserved'; message: string }

/**
 * Compile the character-class body into a regex, or return null when the body
 * is not a valid character class (guards `new RegExp` against throwing on user
 * supplied domain settings).
 */
export function compileSlugPattern(slugAllowedChars: string): RegExp | null {
  if (slugAllowedChars === '' || slugAllowedChars.includes(']')) return null
  try {
    return new RegExp(`^[${slugAllowedChars}]+$`)
  } catch {
    return null
  }
}

export function isValidSlugAllowedChars(slugAllowedChars: string): boolean {
  return compileSlugPattern(slugAllowedChars) != null
}

/**
 * Apply the domain's case rule: case-insensitive domains store (and the edge
 * looks up) pathnames lower-cased.
 */
export function normalizePathname(
  pathname: string,
  grammar: Pick<SlugGrammar, 'slugCaseSensitive'>
): string {
  return grammar.slugCaseSensitive ? pathname : pathname.toLowerCase()
}

export function isReservedPath(
  pathname: string,
  reservedPaths: string[]
): boolean {
  const firstSegment = pathname.split('/')[0].toLowerCase()
  return reservedPaths.some(
    (reserved) => reserved.toLowerCase() === firstSegment
  )
}

/**
 * Validate an already-normalized pathname against the domain grammar.
 * Returns null when the pathname is acceptable.
 */
export function validatePathname(
  pathname: string,
  grammar: SlugGrammar
): SlugValidationError | null {
  const pattern = compileSlugPattern(grammar.slugAllowedChars)
  if (pattern == null)
    return {
      code: 'invalidGrammar',
      message: `domain slug grammar is invalid (${grammar.slugAllowedChars})`
    }
  if (pathname.length < grammar.slugMinLength)
    return {
      code: 'tooShort',
      message: `pathname must be at least ${grammar.slugMinLength} characters`
    }
  if (pathname.length > grammar.slugMaxLength)
    return {
      code: 'tooLong',
      message: `pathname must be at most ${grammar.slugMaxLength} characters`
    }
  if (!pattern.test(pathname))
    return {
      code: 'invalidCharacters',
      message: `pathname may only contain the characters [${grammar.slugAllowedChars}]`
    }
  if (isReservedPath(pathname, grammar.reservedPaths))
    return {
      code: 'reserved',
      message: 'pathname is reserved on this domain'
    }
  return null
}

/**
 * Cheap grammar check the edge Worker applies before it looks a path up.
 * Anything failing this never reaches the store, so it is also the widest
 * grammar a domain may configure.
 */
export const EDGE_PATH_PATTERN = /^[A-Za-z0-9_.~-]{1,64}$/
