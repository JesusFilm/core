import { GraphQLError } from 'graphql'

/**
 * Defense-in-depth against any downstream proxy/fetcher (Next.js Image, OG-card
 * generators, thumbnailers) that might fetch a publisher-supplied URL server-side.
 * Rejects http:, file:, gopher:, data:, etc. — only https: passes.
 */
export function assertHttpsUrl(
  input: string | null | undefined,
  field: string
): void {
  if (input == null) return
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new GraphQLError(`${field} must be a valid https URL`, {
      extensions: { code: 'BAD_USER_INPUT', field }
    })
  }
  if (url.protocol !== 'https:') {
    throw new GraphQLError(`${field} must use the https scheme`, {
      extensions: { code: 'BAD_USER_INPUT', field }
    })
  }
}
