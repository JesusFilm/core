import { ApolloClient, CombinedGraphQLErrors, gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_FIELDS } from '@core/journeys/ui/Campaign/campaignPublicFields'

import {
  GetCampaignPublic,
  GetCampaignPublicVariables
} from '../../../__generated__/GetCampaignPublic'
import type { CampaignReader } from '../resolveCampaignPage/resolveCampaignPage'

// The one page query (glossary: Campaign Page resolution): text pre-resolved
// to the Page Language, both pages' blocks and the chrome as flat lists.
// Mirrors how the journey route reads GET_JOURNEY.
export const GET_CAMPAIGN_PUBLIC = gql`
  ${CAMPAIGN_PUBLIC_FIELDS}
  query GetCampaignPublic($slug: String, $hostname: String, $languageId: ID) {
    campaignPublic(slug: $slug, hostname: $hostname, languageId: $languageId) {
      ...CampaignPublicFields
    }
  }
`

/**
 * How long a campaign read may take. The viewer's `HttpLink` has none, so
 * a hung `campaignPublic` would otherwise hold an uncached page until the
 * function limit.
 */
const CAMPAIGN_READ_TIMEOUT_MS = 5_000

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 200

function isValidCampaignSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug)
  )
}

function isNotFound(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND'
    )
  )
}

/**
 * The production `CampaignReader`: one `campaignPublic` query per read, by
 * slug or by hostname. Null for a draft, unknown or malformed slug, a
 * campaign served only on its Campaign Domain, and a host with no published
 * campaign; any other failure is rethrown, a read that outlasts
 * `CAMPAIGN_READ_TIMEOUT_MS` included (aborted, as an `AbortError`).
 */
export function apolloCampaignReader(
  apolloClient: ApolloClient
): CampaignReader {
  return async (target, languageId) => {
    if ('slug' in target && !isValidCampaignSlug(target.slug)) return null
    if ('hostname' in target && target.hostname === '') return null
    try {
      const { data } = await apolloClient.query<
        GetCampaignPublic,
        GetCampaignPublicVariables
      >({
        query: GET_CAMPAIGN_PUBLIC,
        variables: { ...target, languageId: languageId ?? null },
        context: {
          fetchOptions: {
            signal: AbortSignal.timeout(CAMPAIGN_READ_TIMEOUT_MS)
          }
        }
      })
      return data?.campaignPublic ?? null
    } catch (error) {
      if (isNotFound(error)) return null
      throw error
    }
  }
}
