import { MockLink } from '@apollo/client/testing'

import {
  GetCampaigns_campaigns as Campaign,
  GetCampaigns,
  GetCampaignsVariables
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
