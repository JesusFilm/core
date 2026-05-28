import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { formatISO } from 'date-fns'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'

import { AnalyticsItem, GET_JOURNEY_PLAUSIBLE_VISITORS } from './AnalyticsItem'

vi.mock('date-fns', async () => {
  return {
    ...(await vi.importActual('date-fns')),
    formatISO: vi.fn()
  }
})

const mockFormatIso = formatISO as MockedFunction<typeof formatISO>

const getJourneyPlausibleVisitorsMock: MockedResponse<
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
> = {
  request: {
    query: GET_JOURNEY_PLAUSIBLE_VISITORS,
    variables: {
      id: defaultJourney.id,
      date: '2024-06-01,2024-09-26'
    }
  },
  result: {
    data: {
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }
  }
}

describe('AnalyticsItem', () => {
  beforeEach(() => {
    mockFormatIso.mockReturnValue('2024-09-26')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should link to journey reports page as a list item', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <AnalyticsItem variant="menu-item" journeyId={defaultJourney.id} />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('menuitem', { name: 'Analytics 0 visitors' })
    ).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Analytics 0 visitors' })
    ).toHaveAttribute('href', '/journeys/journey-id/reports')
  })

  it('should link to journey reports page as an icon button', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <AnalyticsItem variant="button" journeyId={defaultJourney.id} />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })

  it('should link to journey reports page as an icon button with modified href if fromJourneyList prop is true', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <AnalyticsItem
              variant="button"
              fromJourneyList={true}
              journeyId={defaultJourney.id}
            />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports?from=journey-list'
    )
  })

  it('should show number of plausible visitors', async () => {
    const result = vi
      .fn()
      .mockReturnValue(getJourneyPlausibleVisitorsMock.result)

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[{ ...getJourneyPlausibleVisitorsMock, result }]}
        >
          <TeamProvider>
            <AnalyticsItem
              variant="icon-button"
              journeyId={defaultJourney.id}
            />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('link')).toHaveTextContent('10')
  })
})
