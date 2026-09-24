import { MockLink } from '@apollo/client/testing'

import {
  GetCampaign,
  GetCampaignVariables,
  GetCampaign_campaign as Campaign
} from '../../../__generated__/GetCampaign'

import { GET_CAMPAIGN } from './useCampaignQuery'

export const getCampaignMock = (
  variables: GetCampaignVariables,
  campaign: Campaign
): MockLink.MockedResponse<GetCampaign, GetCampaignVariables> => ({
  request: { query: GET_CAMPAIGN, variables },
  result: vi.fn(() => ({ data: { campaign } }))
})
