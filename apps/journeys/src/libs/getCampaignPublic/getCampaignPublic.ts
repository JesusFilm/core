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

async function queryCampaignPublic(
  apolloClient: ApolloClient,
  variables: GetCampaignPublicVariables
): Promise<CampaignPublic | null> {
  try {
    const { data } = await apolloClient.query<
      GetCampaignPublic,
      GetCampaignPublicVariables
    >({ query: GET_CAMPAIGN_PUBLIC, variables })
    return data?.campaignPublic ?? null
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
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
  return await queryCampaignPublic(apolloClient, {
    slug,
    languageId: languageId ?? null
  })
}

/**
 * Read the published Campaign Root of a custom domain. Null when the domain
 * has no root campaign or it is a draft, which the route reads as "serve
 * today's journey behaviour"; any other failure is rethrown.
 */
export async function fetchCampaignPublicByHostname(
  apolloClient: ApolloClient,
  hostname: string,
  languageId?: string | null
): Promise<CampaignPublic | null> {
  if (hostname === '') return null
  return await queryCampaignPublic(apolloClient, {
    hostname,
    languageId: languageId ?? null
  })
}

/**
 * The language api-media reads a Watch video's title in when a query sends no
 * `languageId`. A read made without one is only right for Watch text when the
 * Page Language is this one.
 */
const WATCH_TEXT_FALLBACK_LANGUAGE_ID = '529'

export interface CampaignPublicInPageLanguage {
  campaign: CampaignPublic
  language: ResolvedPageLanguage
}

type CampaignReader = (
  languageId?: string | null
) => Promise<CampaignPublic | null>

/**
 * The campaign in the Page Language named by `language` (a bcp47 tag, the
 * `lang` the proxy rewrote into the route; absent means the campaign default).
 * One read in the campaign default yields the language list the tag is
 * resolved against. `wanted`, when given, sees that first read and may veto
 * the rest: a custom-domain visit that turns out to be a journey slug, not a
 * region, stops here instead of paying for a second read.
 */
async function readInPageLanguage(
  read: CampaignReader,
  language: string | null | undefined,
  wanted?: (inDefault: CampaignPublic) => boolean
): Promise<CampaignPublicInPageLanguage | null> {
  const inDefault = await read()
  if (inDefault == null) return null
  if (wanted != null && !wanted(inDefault)) return null
  const resolved = resolvePageLanguage({
    languages: inDefault.languages.map((candidate) => ({
      languageId: candidate.languageId,
      bcp47: candidate.language.bcp47
    })),
    defaultLanguageId: inDefault.defaultLanguageId,
    param: language
  })
  if (
    resolved.languageId === inDefault.languageId &&
    resolved.languageId === WATCH_TEXT_FALLBACK_LANGUAGE_ID
  )
    return { campaign: inDefault, language: resolved }
  const campaign = await read(resolved.languageId)
  if (campaign == null) return null
  return { campaign, language: resolved }
}

/**
 * Read a published campaign in a Page Language: a second read unless the
 * resolved language is the one the first read already used for both the
 * campaign text and the Watch video titles. `language.source` is `param` only
 * when the tag named a campaign language; any other tag reads the default.
 * Null when the campaign is not published.
 */
export async function fetchCampaignPublicInPageLanguage(
  apolloClient: ApolloClient,
  slug: string,
  language?: string | null
): Promise<CampaignPublicInPageLanguage | null> {
  return await readInPageLanguage(
    async (languageId) =>
      await fetchCampaignPublic(apolloClient, slug, languageId),
    language
  )
}

/**
 * The same read for the published Campaign Root of a custom domain. Null
 * when the domain has no root campaign, it is a draft, or `wanted` rejects
 * the root campaign read in its default language.
 */
export async function fetchCampaignPublicInPageLanguageByHostname(
  apolloClient: ApolloClient,
  hostname: string,
  language?: string | null,
  wanted?: (inDefault: CampaignPublic) => boolean
): Promise<CampaignPublicInPageLanguage | null> {
  return await readInPageLanguage(
    async (languageId) =>
      await fetchCampaignPublicByHostname(apolloClient, hostname, languageId),
    language,
    wanted
  )
}
