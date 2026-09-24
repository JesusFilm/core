import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor, within } from '@testing-library/react'

import {
  makeCampaign,
  makeCampaignJourney,
  mockCountryStats
} from '../../../libs/campaignFields/campaignFixture'
import { GET_CAMPAIGN_COUNTRY_STATS } from '../../../libs/useCampaignCountryStatsQuery'
import { GET_CAMPAIGN_JOURNEY_STATS } from '../../../libs/useCampaignJourneyStatsQuery'

import { CampaignAnalyticsPanel } from './CampaignAnalyticsPanel'

vi.mock('../../../libs/buildAllTimeStatsFilter', () => ({
  buildAllTimeStatsFilter: () => ({
    period: 'custom',
    date: '2024-01-01,2026-09-24'
  })
}))

function journeyStatsMock(id: string, visitors: number, pageviews: number) {
  return {
    request: {
      query: GET_CAMPAIGN_JOURNEY_STATS,
      variables: {
        id,
        where: { period: 'custom', date: '2024-01-01,2026-09-24' }
      }
    },
    result: {
      data: {
        journeysPlausibleStatsAggregate: {
          __typename: 'PlausibleStatsAggregateResponse',
          visitors: {
            __typename: 'PlausibleStatsAggregateValue',
            value: visitors
          },
          pageviews: {
            __typename: 'PlausibleStatsAggregateValue',
            value: pageviews
          }
        }
      }
    }
  }
}

describe('CampaignAnalyticsPanel', () => {
  it('shows per-journey rows with totals and the country table', async () => {
    const campaign = makeCampaign({
      shareJourneys: [
        makeCampaignJourney(),
        makeCampaignJourney({ id: 'journey-2', title: 'Donde perteneces' })
      ]
    })
    const onCountryStats = vi.fn()
    render(
      <MockedProvider
        mocks={[
          journeyStatsMock('journey-1', 10, 25),
          journeyStatsMock('journey-2', 5, 7),
          {
            request: {
              query: GET_CAMPAIGN_COUNTRY_STATS,
              variables: { id: 'campaign-1' }
            },
            result: {
              data: {
                campaign: {
                  __typename: 'Campaign',
                  id: 'campaign-1',
                  countryStats: mockCountryStats
                }
              }
            }
          }
        ]}
      >
        <CampaignAnalyticsPanel
          campaign={campaign}
          onCountryStats={onCountryStats}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByTestId('CampaignJourneyStatsTotals')
      ).toHaveTextContent('15')
    )
    expect(screen.getByTestId('CampaignJourneyStatsTotals')).toHaveTextContent(
      '32'
    )
    expect(
      screen.getByTestId('CampaignJourneyStatsRow-journey-1')
    ).toHaveTextContent('10')

    const countryTable = await screen.findByTestId('CampaignCountryStatsTable')
    expect(within(countryTable).getByText('Nigeria')).toBeInTheDocument()
    expect(within(countryTable).getByText('120')).toBeInTheDocument()
    await waitFor(() =>
      expect(onCountryStats).toHaveBeenLastCalledWith(
        expect.objectContaining({ totalVisitors: 120 })
      )
    )
  })

  it('explains when no share journeys are saved', () => {
    render(
      <MockedProvider mocks={[]}>
        <CampaignAnalyticsPanel
          campaign={makeCampaign({ shareJourneys: [] })}
        />
      </MockedProvider>
    )
    expect(
      screen.getByText('Save some share journeys to see their analytics here.')
    ).toBeInTheDocument()
  })
})
