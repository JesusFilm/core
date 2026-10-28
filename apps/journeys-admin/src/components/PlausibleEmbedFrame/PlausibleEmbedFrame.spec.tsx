import { render, screen } from '@testing-library/react'

import { PlausibleEmbedFrame } from './PlausibleEmbedFrame'

describe('PlausibleEmbedFrame', () => {
  it("embeds the site's shared-link dashboard once it has the token", () => {
    render(
      <PlausibleEmbedFrame
        siteId="api-journeys-campaign-campaignId"
        auth="sharedLinkSlug"
      />
    )

    expect(screen.getByTestId('PlausibleEmbedDashboard')).toHaveAttribute(
      'src',
      '/share/api-journeys-campaign-campaignId?auth=sharedLinkSlug&embed=true&theme=light&background=transparent'
    )
    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
  })

  it('waits without a frame while the token is null', () => {
    render(<PlausibleEmbedFrame siteId="api-journeys-journey-journeyId" />)

    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
    expect(
      screen.queryByTestId('PlausibleEmbedDashboard')
    ).not.toBeInTheDocument()
  })

  it('shows the error message instead of the loading one', () => {
    render(
      <PlausibleEmbedFrame siteId="api-journeys-journey-journeyId" error />
    )

    expect(
      screen.getByText('There was an error loading the report')
    ).toBeInTheDocument()
  })
})
