// http:// and https:// — a scheme followed by an authority.
const SCHEME_WITH_AUTHORITY = /^\w+:\/\//
// mailto:, tel: and sms: carry no authority, so they have no `//` to match on.
// Without this the `https://` fallback below mangles them into `https://mailto:…`.
const SCHEME_WITHOUT_AUTHORITY = /^(?:mailto|tel|sms):/i
// One `@`, a dot in the domain, no slashes — an address, not a host.
const BARE_EMAIL = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/

/**
 * Normalizes a chat button link on its way to the API.
 *
 * The chat widget is not URL-only: the Mail icon takes an email address and the
 * phone icons take a number, so a value can legitimately arrive already carrying
 * a `mailto:`/`tel:`/`sms:` scheme, or as a bare email address. Only a value that
 * is none of those gets the `https://` prefix a bare hostname needs.
 */
export function normalizeChatButtonLink(value?: string): string {
  const trimmed = value?.trim() ?? ''
  if (trimmed === '') return ''
  if (SCHEME_WITH_AUTHORITY.test(trimmed)) return trimmed
  if (SCHEME_WITHOUT_AUTHORITY.test(trimmed)) return trimmed
  if (BARE_EMAIL.test(trimmed)) return `mailto:${trimmed}`
  return `https://${trimmed}`
}
