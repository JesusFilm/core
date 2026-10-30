import { render, screen } from '@testing-library/react'

import {
  PlausibleEmbedFrame,
  plausibleEmbedStatus
} from './PlausibleEmbedFrame'

describe('PlausibleEmbedFrame', () => {
  it("embeds the site's shared-link dashboard once it is ready", () => {
    render(
      <PlausibleEmbedFrame
        siteId="api-journeys-campaign-campaignId"
        status={{ state: 'ready', token: 'sharedLinkSlug' }}
      />
    )

    expect(screen.getByTestId('PlausibleEmbedFrame')).toHaveAttribute(
      'src',
      '/share/api-journeys-campaign-campaignId?auth=sharedLinkSlug&embed=true&theme=light&background=transparent'
    )
    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
  })

  it('waits without a frame while loading', () => {
    render(
      <PlausibleEmbedFrame
        siteId="api-journeys-journey-journeyId"
        status={{ state: 'loading' }}
      />
    )

    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('PlausibleEmbedFrame')).not.toBeInTheDocument()
  })

  it('says the report is being set up when the site has no token yet', () => {
    render(
      <PlausibleEmbedFrame
        siteId="api-journeys-campaign-campaignId"
        status={{ state: 'settingUp' }}
      />
    )

    expect(
      screen.getByText(
        'The report is being set up. Check back in a few minutes.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId('PlausibleEmbedFrame')).not.toBeInTheDocument()
  })

  it('shows the error message when the report fails to load', () => {
    render(
      <PlausibleEmbedFrame
        siteId="api-journeys-journey-journeyId"
        status={{ state: 'error' }}
      />
    )

    expect(
      screen.getByText('There was an error loading the report')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('PlausibleEmbedFrame')).not.toBeInTheDocument()
  })
})

describe('plausibleEmbedStatus', () => {
  it('reads a report query as loading, error, setting up or ready', () => {
    expect(plausibleEmbedStatus({ loading: true, token: 'slug' })).toEqual({
      state: 'loading'
    })
    expect(
      plausibleEmbedStatus({ loading: false, error: new Error('network') })
    ).toEqual({ state: 'error' })
    expect(plausibleEmbedStatus({ loading: false, token: null })).toEqual({
      state: 'settingUp'
    })
    expect(plausibleEmbedStatus({ loading: false, token: 'slug' })).toEqual({
      state: 'ready',
      token: 'slug'
    })
  })
})
