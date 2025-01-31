import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getJourneyAnalytics } from '@core/journeys/ui/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.mock'

import { GetJourney_journey } from '../../../../../../__generated__/GetJourney'

import { earliestStatsCollected } from './AnalyticsOverlaySwitch'

import { AnalyticsOverlaySwitch } from '.'

const mockCurrentDate = '2024-06-02'

describe('AnalyticsOverlaySwitch', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-02'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('toggles showAnalytics', async () => {
    const result = jest.fn().mockReturnValue(getJourneyAnalytics.result)
    const journey = { id: 'journeyId' } as unknown as GetJourney_journey
    const request = {
      ...getJourneyAnalytics.request,
      variables: {
        ...getJourneyAnalytics.request.variables,
        period: 'custom',
        date: `${earliestStatsCollected},${mockCurrentDate}`
      }
    }
    render(
      <MockedProvider
        mocks={[
          {
            request,
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <EditorProvider>
            {({ state: { showAnalytics, analytics } }) => (
              <>
                <div data-testid="showAnalytics">
                  {showAnalytics?.toString()}
                </div>
                <div data-testid="analytics">{JSON.stringify(analytics)}</div>
                <AnalyticsOverlaySwitch />
              </>
            )}
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const showAnalytics = screen.getByTestId('showAnalytics')
    const analytics = screen.getByTestId('analytics')
    expect(showAnalytics).toHaveTextContent('')
    screen.getByRole('checkbox').click()
    expect(showAnalytics).toHaveTextContent('true')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(JSON.parse(analytics.textContent ?? '')).toMatchObject({
      totalVisitors: 10,
      chatsStarted: 5,
      linksVisited: 10,
      referrers: { nodes: expect.any(Array), edges: expect.any(Array) },
      stepsStats: expect.any(Array),
      stepMap: {},
      blockMap: {},
      targetMap: {}
    })
    screen.getByRole('checkbox').click()
    expect(showAnalytics).toHaveTextContent('false')
  })
})
