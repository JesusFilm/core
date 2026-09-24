import { MockLink } from '@apollo/client/testing'

import {
  GetCampaigns,
  GetCampaignsVariables,
  GetCampaigns_campaigns as Campaign
} from '../../../__generated__/GetCampaigns'

import { GET_CAMPAIGNS } from './useCampaignsQuery'

export const getCampaignsMock = (
  variables: GetCampaignsVariables,
  campaigns: readonly Campaign[] = []
): MockLink.MockedResponse<GetCampaigns, GetCampaignsVariables> => ({
  request: { query: GET_CAMPAIGNS, variables },
  result: vi.fn(() => ({
    data: { campaigns: [...campaigns] }
  }))
})
