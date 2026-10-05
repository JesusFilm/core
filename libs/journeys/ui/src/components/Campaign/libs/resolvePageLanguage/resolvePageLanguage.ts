/** A campaign language as the resolver needs it: the api-languages id and its bcp47 tag. */
export interface PageLanguageCandidate {
  languageId: string
  bcp47: string | null
}

export interface ResolvePageLanguageInput {
  /** The campaign's Page Languages in selector order. */
  languages: readonly PageLanguageCandidate[]
  /** `Campaign.defaultLanguageId`; always one of `languages`. */
  defaultLanguageId: string
  /** The `lang` query param, a bcp47 tag, when the link carried one. */
  param?: string | string[] | null
  /** The language cookie the header select wrote, a bcp47 tag. */
  cookie?: string | null
  /** The request's `Accept-Language` header. */
  acceptLanguage?: string | null
}

export type PageLanguageSource =
  | 'param'
  | 'cookie'
  | 'acceptLanguage'
  | 'default'

export interface ResolvedPageLanguage {
  languageId: string
  bcp47: string | null
  /** Which step of the order decided; `param` means the response is fully determined by the URL. */
  source: PageLanguageSource
}

/** The name of the cookie the header's language select writes. */
export const CAMPAIGN_LANGUAGE_COOKIE = 'campaign-lang'

/** The query param every in-campaign link carries forward. */
export const CAMPAIGN_LANGUAGE_PARAM = 'lang'

function normalise(tag: string | null | undefined): string | null {
  if (tag == null) return null
  const trimmed = tag.trim().toLowerCase()
  return trimmed === '' ? null : trimmed
}

/** An exact, case-insensitive bcp47 match against the campaign languages. */
function exactMatch(
  languages: readonly PageLanguageCandidate[],
  tag: string | string[] | null | undefined
): PageLanguageCandidate | null {
  const wanted = normalise(Array.isArray(tag) ? tag[0] : tag)
  if (wanted == null) return null
  return (
    languages.find((language) => normalise(language.bcp47) === wanted) ?? null
  )
}

/**
 * Parse an `Accept-Language` header into tags ordered by descending quality
 * (ties keep header order); `*` and `q=0` entries are dropped.
 */
export function parseAcceptLanguage(
  header: string | null | undefined
): string[] {
  if (header == null) return []
  return header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith('q='))
      const quality = q == null ? 1 : Number.parseFloat(q.slice(2))
      return {
        tag: normalise(tag),
        quality: Number.isNaN(quality) ? 0 : quality,
        index
      }
    })
    .filter(
      (entry): entry is { tag: string; quality: number; index: number } =>
        entry.tag != null && entry.tag !== '*' && entry.quality > 0
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.tag)
}

/**
 * The first accepted tag that matches a campaign language exactly or by
 * primary-subtag prefix (`en-US` ↔ `en`, either way round).
 */
function acceptLanguageMatch(
  languages: readonly PageLanguageCandidate[],
  header: string | null | undefined
): PageLanguageCandidate | null {
  for (const tag of parseAcceptLanguage(header)) {
    const exact = exactMatch(languages, tag)
    if (exact != null) return exact
    const primary = tag.split('-')[0]
    const prefixed = languages.find((language) => {
      const bcp47 = normalise(language.bcp47)
      return bcp47 != null && bcp47.split('-')[0] === primary
    })
    if (prefixed != null) return prefixed
  }
  return null
}

/**
 * The visitor's Page Language (PRD §2): `?lang=<bcp47>` naming a campaign
 * language, then the saved cookie, then an `Accept-Language` prefix match
 * against the campaign languages, then the campaign default. Pure, so the
 * four routes and the editor preview share one rule.
 */
export function resolvePageLanguage({
  languages,
  defaultLanguageId,
  param,
  cookie,
  acceptLanguage
}: ResolvePageLanguageInput): ResolvedPageLanguage {
  const fromParam = exactMatch(languages, param)
  if (fromParam != null) return { ...fromParam, source: 'param' }

  const fromCookie = exactMatch(languages, cookie)
  if (fromCookie != null) return { ...fromCookie, source: 'cookie' }

  const fromHeader = acceptLanguageMatch(languages, acceptLanguage)
  if (fromHeader != null) return { ...fromHeader, source: 'acceptLanguage' }

  const fallback = languages.find(
    (language) => language.languageId === defaultLanguageId
  )
  return {
    languageId: defaultLanguageId,
    bcp47: fallback?.bcp47 ?? null,
    source: 'default'
  }
}
