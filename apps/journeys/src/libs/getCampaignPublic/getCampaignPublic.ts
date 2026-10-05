import { ApolloClient, CombinedGraphQLErrors, gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_FIELDS } from '@core/journeys/ui/Campaign'

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
 * Read a published campaign for the public page. Null for a draft, unknown
 * or malformed slug (the route answers not found with `revalidate: 1`);
 * any other failure is rethrown so the previous page stays served.
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
