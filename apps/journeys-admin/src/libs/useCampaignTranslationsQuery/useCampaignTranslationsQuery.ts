import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaignTranslations,
  GetCampaignTranslationsVariables
} from '../../../__generated__/GetCampaignTranslations'

export const CAMPAIGN_TRANSLATIONS = gql`
  query GetCampaignTranslations(
    $campaignId: ID!
    $languageId: ID!
    $filter: CampaignTranslationFilter
  ) {
    campaignTranslations(
      campaignId: $campaignId
      languageId: $languageId
      filter: $filter
    ) {
      group
      field
      maxLength
      defaultValue
      value
      source
      needsReview
      target {
        typename
        blockId
        regionId
        stringId
        campaignId
      }
    }
  }
`

/**
 * Every Translated Field of a campaign in one language, for the Translations
 * view. Skipped until both the campaign and a language are chosen. Rows have
 * no ids to normalise on, so each open also asks the network: canvas edits and
 * new sections would otherwise leave a cached list stale.
 */
export function useCampaignTranslationsQuery(
  variables?: GetCampaignTranslationsVariables
): useQuery.Result<
  GetCampaignTranslations,
  GetCampaignTranslationsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignTranslationsVariables>
> {
  return useQuery<GetCampaignTranslations, GetCampaignTranslationsVariables>(
    CAMPAIGN_TRANSLATIONS,
    variables == null
      ? skipToken
      : { variables, fetchPolicy: 'cache-and-network' }
  )
}
