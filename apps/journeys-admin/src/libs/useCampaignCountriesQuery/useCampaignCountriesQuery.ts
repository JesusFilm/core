import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { GetCampaignCountries } from '../../../__generated__/GetCampaignCountries'

/**
 * Every api-languages country for the region settings' chip picker: the
 * list is a few hundred rows, so it is read once and filtered client-side.
 */
export const GET_CAMPAIGN_COUNTRIES = gql`
  query GetCampaignCountries {
    countries {
      id
      flagPngSrc
      name(primary: true) {
        value
      }
    }
  }
`

export function useCampaignCountriesQuery(): useQuery.Result<
  GetCampaignCountries,
  Record<string, never>,
  'empty' | 'complete' | 'streaming'
> {
  return useQuery<GetCampaignCountries, Record<string, never>>(
    GET_CAMPAIGN_COUNTRIES
  )
}
