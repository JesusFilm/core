import { act, fireEvent, render, screen } from '@testing-library/react'

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

  it('adds the stylesheet and reveals the dashboard a second after the frame has loaded', () => {
    vi.useFakeTimers()
    // jsdom loads nothing into the frame, so give it a document to style.
    const appendChild = vi.fn()
    const contentWindow = vi
      .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
      .mockReturnValue({ document: { head: { appendChild } } } as never)
    try {
      render(
        <PlausibleEmbedFrame
          siteId="api-journeys-campaign-campaignId"
          status={{ state: 'ready', token: 'sharedLinkSlug' }}
        />
      )

      fireEvent.load(screen.getByTestId('PlausibleEmbedFrame'))
      expect(appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringMatching(/\/plausible\.css$/)
        })
      )
      act(() => {
        vi.advanceTimersByTime(999)
      })
      expect(screen.getByText('The report is loading...')).toBeVisible()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByText('The report is loading...')).not.toBeVisible()
    } finally {
      contentWindow.mockRestore()
      vi.useRealTimers()
    }
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
    expect(
      plausibleEmbedStatus({ loading: true, data: { plausibleToken: 'slug' } })
    ).toEqual({ state: 'loading' })
    expect(
      plausibleEmbedStatus({ loading: false, error: new Error('network') })
    ).toEqual({ state: 'error' })
    expect(
      plausibleEmbedStatus({ loading: false, data: { plausibleToken: null } })
    ).toEqual({ state: 'settingUp' })
    expect(
      plausibleEmbedStatus({ loading: false, data: { plausibleToken: 'slug' } })
    ).toEqual({ state: 'ready', token: 'slug' })
  })

  it('stays loading, not setting up, while no data has arrived', () => {
    expect(plausibleEmbedStatus({ loading: false })).toEqual({
      state: 'loading'
    })
    expect(plausibleEmbedStatus({ loading: false, data: null })).toEqual({
      state: 'loading'
    })
  })
})
