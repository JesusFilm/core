import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  CampaignTranslations,
  CampaignTranslationsVariables
} from '../../../__generated__/CampaignTranslations'

export const CAMPAIGN_TRANSLATIONS = gql`
  query CampaignTranslations(
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
 * view. Skipped until both the campaign and a language are chosen.
 */
export function useCampaignTranslationsQuery(
  variables?: CampaignTranslationsVariables
): useQuery.Result<
  CampaignTranslations,
  CampaignTranslationsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<CampaignTranslationsVariables>
> {
  return useQuery<CampaignTranslations, CampaignTranslationsVariables>(
    CAMPAIGN_TRANSLATIONS,
    variables == null ? skipToken : { variables }
  )
}
