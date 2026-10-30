import { render } from '@testing-library/react'

import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { CampaignPageWrapper } from '../CampaignPageWrapper'
import { LanguageFallbackRedirect } from '../LanguageFallbackRedirect'

import { CampaignRoute } from './CampaignRoute'

vi.mock('../CampaignPageWrapper', () => ({
  CampaignPageWrapper: vi.fn(() => null)
}))

vi.mock('../LanguageFallbackRedirect', () => ({
  LanguageFallbackRedirect: vi.fn(() => null)
}))

describe('CampaignRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the resolved Campaign Page', () => {
    render(
      <CampaignRoute
        kind="page"
        campaign={campaignPublic}
        pageKind={CampaignPageKind.regionTemplate}
        region={eurRegion}
      />
    )

    expect(vi.mocked(CampaignPageWrapper).mock.calls[0][0]).toEqual({
      campaign: campaignPublic,
      pageKind: CampaignPageKind.regionTemplate,
      region: eurRegion
    })
    expect(LanguageFallbackRedirect).not.toHaveBeenCalled()
  })

  it('sends a language fallback to the plain page, naming its campaign', () => {
    render(
      <CampaignRoute
        kind="languageFallback"
        destination="/campaign/outreach-2026/eur"
        campaignId={campaignPublic.id}
      />
    )

    expect(vi.mocked(LanguageFallbackRedirect).mock.calls[0][0]).toEqual({
      destination: '/campaign/outreach-2026/eur',
      campaignId: campaignPublic.id
    })
    expect(CampaignPageWrapper).not.toHaveBeenCalled()
  })
})
