import { ApolloClient, CombinedGraphQLErrors, gql } from '@apollo/client'

import {
  CAMPAIGN_PUBLIC_FIELDS,
  resolvePageLanguage
} from '@core/journeys/ui/Campaign'
import type { ResolvedPageLanguage } from '@core/journeys/ui/Campaign'

import {
  GetCampaignPublic_campaignPublic as CampaignPublic,
  GetCampaignPublic,
  GetCampaignPublicVariables
} from '../../../__generated__/GetCampaignPublic'

// The one page query (PRD §11): one server-side request per render, text
// pre-resolved to the Page Language, both pages' blocks and the chrome as
// flat lists. Mirrors how the journey route reads GET_JOURNEY.
export const GET_CAMPAIGN_PUBLIC = gql`
  ${CAMPAIGN_PUBLIC_FIELDS}
  query GetCampaignPublic($slug: String, $hostname: String, $languageId: ID) {
    campaignPublic(slug: $slug, hostname: $hostname, languageId: $languageId) {
      ...CampaignPublicFields
    }
  }
`

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 200

export function isValidCampaignSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug)
  )
}

function isNotFound(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error))
    return error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND'
    )
  const networkError = (error as { networkError?: { statusCode?: number } })
    .networkError
  return networkError?.statusCode === 400
}

/**
 * Read a published campaign for the public page in one language. Null for a
 * draft, unknown or malformed slug (the route answers not found); any other
 * failure is rethrown.
 */
export async function fetchCampaignPublic(
  apolloClient: ApolloClient,
  slug: string,
  languageId?: string | null
): Promise<CampaignPublic | null> {
  if (!isValidCampaignSlug(slug)) return null
  try {
    const { data } = await apolloClient.query<
      GetCampaignPublic,
      GetCampaignPublicVariables
    >({
      query: GET_CAMPAIGN_PUBLIC,
      variables: { slug, languageId: languageId ?? null }
    })
    return data?.campaignPublic ?? null
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

/** What the request carries that decides the Page Language (PRD §2). */
export interface PageLanguageRequest {
  /** The `lang` query param. */
  param?: string | string[] | null
  /** The language cookie the header select wrote. */
  cookie?: string | null
  /** The `Accept-Language` header. */
  acceptLanguage?: string | null
}

export interface CampaignPublicInPageLanguage {
  campaign: CampaignPublic
  language: ResolvedPageLanguage
}

/**
 * Read a published campaign in the visitor's Page Language: one read in the
 * campaign default yields the language list the request is resolved
 * against (`?lang` → cookie → `Accept-Language` → default), then a second
 * read only when the resolved language differs. Null when the campaign is
 * not published.
 */
export async function fetchCampaignPublicInPageLanguage(
  apolloClient: ApolloClient,
  slug: string,
  request: PageLanguageRequest
): Promise<CampaignPublicInPageLanguage | null> {
  const inDefault = await fetchCampaignPublic(apolloClient, slug)
  if (inDefault == null) return null
  const language = resolvePageLanguage({
    languages: inDefault.languages.map((candidate) => ({
      languageId: candidate.languageId,
      bcp47: candidate.language.bcp47
    })),
    defaultLanguageId: inDefault.defaultLanguageId,
    ...request
  })
  if (language.languageId === inDefault.languageId)
    return { campaign: inDefault, language }
  const campaign = await fetchCampaignPublic(
    apolloClient,
    slug,
    language.languageId
  )
  if (campaign == null) return null
  return { campaign, language }
}

/**
 * The `Cache-Control` a campaign page answers with: shared caching only when
 * the `lang` param decided the language, so the response is a function of
 * the URL alone. Every other outcome depends on the visitor's cookie or
 * `Accept-Language` (a default-language answer included: the next visitor at
 * the same URL may carry a cookie), so it is private. Every in-campaign link
 * and the header select carry the param, so only a first visit is uncached.
 */
export function campaignPageCacheControl(
  language: ResolvedPageLanguage
): string {
  return language.source === 'param'
    ? 'public, s-maxage=60, stale-while-revalidate=300'
    : 'private, no-cache'
}
