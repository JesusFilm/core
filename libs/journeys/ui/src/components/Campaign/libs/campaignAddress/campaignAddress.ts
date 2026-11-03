import { CAMPAIGN_LANGUAGE_PARAM } from '../resolvePageLanguage'

/**
 * What a Campaign Address is built from: the campaign's slug and the name of
 * its Campaign Domain, or null when it has none. Callers adapt their own
 * shape through `campaignDomainName`.
 */
export interface CampaignAddressInput {
  slug: string
  domainName: string | null
}

export interface CampaignAbsoluteAddressOptions {
  /** The root domain's origin, e.g. `https://your.nextstep.is`; each tier passes its own. */
  rootOrigin: string
}

/** What the language of an in-campaign link is read from. */
export interface CampaignLinkLanguage {
  /** The Page Language the page renders in. */
  language: { bcp47: string | null }
  /** The campaign's Page Languages; a link carries the language when there are two or more. */
  languages: readonly unknown[]
}

/** One of the campaign's Page Languages, as a canonical or `hreflang` URL names it. */
export interface CampaignAddressLanguage {
  languageId: string
  bcp47: string | null
}

// A `lang` value worth a page of its own: a bcp47-shaped tag, lowercased.
// Anything else is served the plain page, so a junk value cannot mint cache
// entries. The same pattern as the journeys app's proxy.
const LANGUAGE_TAG_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{2,8}){0,3}$/

/**
 * The campaign's Campaign Domain from the names of its custom domains: the
 * first non-empty one, or null. An empty name counts as no domain.
 */
export function campaignDomainName(names: readonly string[]): string | null {
  return names.find((name) => name !== '') ?? null
}

/**
 * Where the landing page is served under its origin: `` on a Campaign
 * Domain, `/campaign/<slug>` on the root domain.
 */
export function campaignBasePath({
  slug,
  domainName
}: CampaignAddressInput): string {
  return domainName == null ? `/campaign/${slug}` : ''
}

/**
 * The path of the landing page, or of the region page `regionSlug` names,
 * under its origin: `/` or `/<region>` on a Campaign Domain,
 * `/campaign/<slug>[/<region>]` on the root domain.
 */
export function campaignPagePath(
  input: CampaignAddressInput,
  regionSlug?: string | null
): string {
  const basePath = campaignBasePath(input)
  if (regionSlug != null) return `${basePath}/${regionSlug}`
  return basePath === '' ? '/' : basePath
}

/**
 * The absolute Campaign Address of the landing page, or of a region page:
 * on the Campaign Domain's root when the campaign has one, else under the
 * root domain's `rootOrigin`.
 */
export function campaignAbsoluteAddress(
  input: CampaignAddressInput,
  { rootOrigin }: CampaignAbsoluteAddressOptions,
  regionSlug?: string | null
): string {
  const origin =
    input.domainName == null ? rootOrigin : `https://${input.domainName}`
  return `${origin}${campaignPagePath(input, regionSlug)}`
}

/** A campaign page's path or address in a Page Language: `<path>?lang=<bcp47>`. */
export function withPageLanguage(path: string, bcp47: string): string {
  return `${path}?${CAMPAIGN_LANGUAGE_PARAM}=${encodeURIComponent(bcp47)}`
}

/**
 * An in-campaign link in the current Page Language: the language is carried
 * whenever the visitor has a choice (two or more campaign languages), so it
 * survives a region switch, the default language included.
 */
export function campaignLinkPath(
  path: string,
  { language, languages }: CampaignLinkLanguage
): string {
  if (languages.length < 2 || language.bcp47 == null) return path
  return withPageLanguage(path, language.bcp47)
}

/**
 * The address a campaign page is served at in one language, as a canonical
 * or an `hreflang` alternate names it: the bare address for the campaign
 * default (and for a language with no bcp47 tag to name), else with
 * `?lang=`. Each language has exactly one address, so a page's canonical and
 * the alternate naming its language are the same URL.
 */
export function campaignLanguageAddress(
  address: string,
  defaultLanguageId: string,
  { languageId, bcp47 }: CampaignAddressLanguage
): string {
  if (bcp47 == null || languageId === defaultLanguageId) return address
  return withPageLanguage(address, bcp47)
}

/**
 * The tag the viewer serves a Page Language's pages under (`_lang/<tag>`):
 * its bcp47 tag lowercased, as the proxy reads `?lang=`. A tag that is not
 * bcp47-shaped is null: the proxy never routes it to a page of its own.
 */
export function pageLanguageTag(
  bcp47: string | null | undefined
): string | null {
  const tag = bcp47?.toLowerCase()
  if (tag == null || !LANGUAGE_TAG_PATTERN.test(tag)) return null
  return tag
}

/**
 * The viewer's page path of a campaign page in a Page Language: the pages
 * are statically generated, so the language is part of the path, as
 * `_lang/<tag>` ahead of the optional region. `prefix` is the page path the
 * public prefix is rewritten to (`/home/campaign/<slug>`, or `/<hostname>`
 * on a Campaign Domain) and `segments` are the public path's segments after
 * it. A page path, never an address.
 */
export function languagePagePath(
  prefix: string,
  segments: readonly string[],
  tag: string
): string {
  return [prefix, '_lang', tag, ...segments].join('/')
}

/**
 * The plain public path of the page a `_lang` page path serves, where the
 * route sends a tag that is not one of the campaign's languages: `basePath`
 * (`campaignBasePath`, or `` on any host other than the root domain) and the
 * segments after it.
 */
export function plainPagePath(
  basePath: string,
  segments: readonly string[]
): string {
  const path = [basePath, ...segments].join('/')
  return path === '' ? '/' : path
}
