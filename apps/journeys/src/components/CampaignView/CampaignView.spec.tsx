import { render, screen } from '@testing-library/react'

import {
  makeCampaign,
  makeCampaignLinkMedia,
  mockCountryStats
} from './campaignFixture'
import { CampaignView, toCampaignData } from './CampaignView'

describe('CampaignView', () => {
  it('maps the campaign and renders the public page', () => {
    render(
      <CampaignView campaign={makeCampaign()} countryStats={mockCountryStats} />
    )
    expect(screen.getByTestId('PublicCampaignPage')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Share the Gospel during the World Cup'
      })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Share link')).toHaveValue(
      'https://your.nextstep.is/you-belong-english'
    )
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(screen.getAllByText('Nigeria')).toHaveLength(2)
  })

  it('maps link media and null stats', () => {
    const data = toCampaignData(
      makeCampaign({
        media: makeCampaignLinkMedia('https://www.youtube.com/embed/abc')
      }),
      null
    )
    expect(data.media).toEqual({
      type: 'link',
      embedUrl: 'https://www.youtube.com/embed/abc'
    })
    expect(data.countryStats).toBeNull()
    expect(data.publicOrigin).toBe('https://your.nextstep.is')
  })
})
