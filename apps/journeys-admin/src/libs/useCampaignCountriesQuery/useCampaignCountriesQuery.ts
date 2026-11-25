import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaignCountries,
  GetCampaignCountriesVariables
} from '../../../__generated__/GetCampaignCountries'

/**
 * The picker reads all countries with their primary names. The canvas requests
 * only the countries on its region cards, in the selected preview language.
 */
export const GET_CAMPAIGN_COUNTRIES = gql`
  query GetCampaignCountries($ids: [ID!], $languageId: ID) {
    countries(ids: $ids) {
      id
      flagPngSrc
      name(languageId: $languageId, primary: true) {
        value
      }
    }
  }
`

export function useCampaignCountriesQuery(
  variables?: GetCampaignCountriesVariables
): useQuery.Result<
  GetCampaignCountries,
  GetCampaignCountriesVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignCountriesVariables>
> {
  return useQuery<GetCampaignCountries, GetCampaignCountriesVariables>(
    GET_CAMPAIGN_COUNTRIES,
    variables?.ids?.length === 0 ? skipToken : { variables }
  )
}
