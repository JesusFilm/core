import { type MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'

import type { GetCampaignReport } from '../../../__generated__/GetCampaignReport'

import { CampaignReport, GET_CAMPAIGN_REPORT } from './CampaignReport'

function reportMock(
  plausibleToken: string | null
): MockLink.MockedResponse<GetCampaignReport> {
  return {
    request: { query: GET_CAMPAIGN_REPORT, variables: { id: 'campaignId' } },
    result: {
      data: {
        campaign: { __typename: 'Campaign', id: 'campaignId', plausibleToken }
      }
    }
  }
}

describe('CampaignReport', () => {
  it("embeds the campaign site's Plausible dashboard with its shared-link token", async () => {
    render(
      <MockedProvider mocks={[reportMock('sharedLinkSlug')]}>
        <CampaignReport campaignId="campaignId" />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('PlausibleEmbedFrame')).toHaveAttribute(
        'src',
        '/share/api-journeys-campaign-campaignId?auth=sharedLinkSlug&embed=true&theme=light&background=transparent'
      )
    )
  })

  it('shows the loading message while the campaign loads', () => {
    render(
      <MockedProvider mocks={[reportMock('sharedLinkSlug')]}>
        <CampaignReport campaignId="campaignId" />
      </MockedProvider>
    )

    expect(screen.getByText('The report is loading...')).toBeInTheDocument()
    expect(
      screen.queryByTestId('PlausibleEmbedFrame')
    ).not.toBeInTheDocument()
  })

  it('says the report is being set up while the campaign has no Plausible site yet', async () => {
    render(
      <MockedProvider mocks={[reportMock(null)]}>
        <CampaignReport campaignId="campaignId" />
      </MockedProvider>
    )

    expect(
      await screen.findByText(
        'The report is being set up. Check back in a few minutes.'
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('PlausibleEmbedFrame')
    ).not.toBeInTheDocument()
  })

  it('shows the error message when the campaign fails to load', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_CAMPAIGN_REPORT,
              variables: { id: 'campaignId' }
            },
            error: new Error('network')
          }
        ]}
      >
        <CampaignReport campaignId="campaignId" />
      </MockedProvider>
    )

    expect(
      await screen.findByText('There was an error loading the report')
    ).toBeInTheDocument()
  })
})
