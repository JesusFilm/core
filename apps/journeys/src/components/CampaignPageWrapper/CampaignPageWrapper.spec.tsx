import { render } from '@testing-library/react'
import PlausibleProvider from 'next-plausible'
import { ReactNode } from 'react'

import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'

import { CampaignPageKind } from '../../../__generated__/globalTypes'

import { CampaignPageWrapper } from './CampaignPageWrapper'

vi.mock('next-plausible', () => ({
  default: vi.fn(({ children }: { children: ReactNode }) => children)
}))

vi.mock('@core/journeys/ui/Campaign', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@core/journeys/ui/Campaign')>()),
  CampaignPage: () => null,
  CampaignSeo: () => null
}))

vi.mock('../CampaignLanguageRedirect', () => ({
  CampaignLanguageRedirect: () => null
}))

function plausibleProps(): Record<string, unknown> {
  return vi.mocked(PlausibleProvider).mock.calls[0][0] as unknown as Record<
    string,
    unknown
  >
}

describe('CampaignPageWrapper', () => {
  beforeEach(() => {
    vi.mocked(PlausibleProvider).mockClear()
  })

  it("reports to the campaign's own Plausible site and its team's", () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.landing}
      />
    )
    expect(plausibleProps()).toMatchObject({
      domain: `api-journeys-campaign-campaignId,api-journeys-team-${campaignPublic.teamId}`,
      customDomain: '/plausible',
      trackOutboundLinks: true
    })
  })

  it('tags a landing page view with the campaign and the Page Language', () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.landing}
      />
    )
    expect(plausibleProps().pageviewProps).toEqual({
      campaignId: 'campaignId',
      language: 'en'
    })
  })

  it("tags a Region Page view with the region's slug too", () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.regionTemplate}
        region={eurRegion}
      />
    )
    expect(plausibleProps().pageviewProps).toEqual({
      campaignId: 'campaignId',
      region: 'eur',
      language: 'en'
    })
  })
})
