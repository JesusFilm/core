/**
 * A self-contained embed provider: the bare lowercased hostnames it owns and
 * the function that turns a pasted URL into a stored iframe `embedUrl`.
 *
 * Declaring the host list and the handler together means they cannot drift out
 * of sync — `linkValidate` derives both the built-in allowlist and the
 * normalizer dispatch table from the same `SPECS` array. Adding a provider that
 * needs URL-specific handling is one file plus one entry in that array.
 */
export interface EmbedNormalizerSpec {
  /** Bare, lowercased hostnames this provider handles (e.g. `canva.com`). */
  hosts: ReadonlyArray<string>
  /**
   * Validates + normalizes a pasted URL into an embeddable `embedUrl`. Throws a
   * `GraphQLError` (BAD_USER_INPUT with a structured `reason`) when the URL
   * cannot be turned into a verified embed — never returns an unverified URL.
   */
  normalize: (url: string) => Promise<{ embedUrl: string }>
}
