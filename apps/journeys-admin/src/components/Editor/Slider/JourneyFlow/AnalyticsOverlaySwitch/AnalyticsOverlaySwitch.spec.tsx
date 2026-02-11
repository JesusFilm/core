import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatISO } from 'date-fns'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getJourneyAnalytics } from '@core/journeys/ui/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.mock'

import { GetJourney_journey } from '../../../../../../__generated__/GetJourney'

import { earliestStatsCollected } from './AnalyticsOverlaySwitch'
import { buildPlausibleDateRange } from './buildPlausibleDateRange'

import { AnalyticsOverlaySwitch } from '.'

jest.mock('./buildPlausibleDateRange')

const mockBuildPlausibleDateRange =
  buildPlausibleDateRange as jest.MockedFunction<typeof buildPlausibleDateRange>

const mockCurrentDate = '2024-06-02'

describe('AnalyticsOverlaySwitch', () => {
  beforeEach(() => {
    mockBuildPlausibleDateRange.mockClear()
  })

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-02'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('toggles showAnalytics', async () => {
    mockBuildPlausibleDateRange.mockReturnValue(
      `${earliestStatsCollected},${mockCurrentDate}`
    )
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

  it('gets analytics for selected date range', async () => {
    const selectedStartDate = new Date('2024-06-05')
    const selectedEndDate = new Date('2024-06-10')
    const formattedDateRange = `${formatISO(selectedStartDate, {
      representation: 'date'
    })},${formatISO(selectedEndDate, { representation: 'date' })}`

    // Pretend the date picker has already produced our custom range
    mockBuildPlausibleDateRange.mockReturnValue(formattedDateRange)

    const result = jest.fn().mockReturnValue(getJourneyAnalytics.result)
    const journey = { id: 'journeyId' } as unknown as GetJourney_journey

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              ...getJourneyAnalytics.request,
              variables: {
                ...getJourneyAnalytics.request.variables,
                period: 'custom',
                date: formattedDateRange
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <EditorProvider>
            {({ state: { analytics } }) => (
              <>
                <div data-testid="analytics">{JSON.stringify(analytics)}</div>
                <AnalyticsOverlaySwitch />
              </>
            )}
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const analyticsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(analyticsCheckbox)

    // Verify the network call was made with the mocked date range
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })
})
