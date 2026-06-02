import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { formatISO } from 'date-fns'
import { type MockedFunction } from 'vitest'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

import {
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
} from '../../../../../../../../__generated__/GetPlausibleJourneyQrCodeScans'

import { GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS, ScanCount } from './ScanCount'

vi.mock('date-fns', async () => {
  return {
    ...(await vi.importActual('date-fns')),
    formatISO: vi.fn()
  }
})

const mockFormatIso = formatISO as MockedFunction<typeof formatISO>

describe('ScanCount', () => {
  beforeEach(() => {
    mockFormatIso.mockReturnValue('2024-09-26')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the scan count', async () => {
    const getPlausibleJourneyQrCodeScansMock: MockedResponse<
      GetPlausibleJourneyQrCodeScans,
      GetPlausibleJourneyQrCodeScansVariables
    > = {
      request: {
        query: GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS,
        variables: {
          id: 'journey.id',
          filters: 'visit:utm_campaign==shortLink.id',
          date: '2024-06-01,2024-09-26'
        }
      },
      result: {
        data: {
          journeysPlausibleStatsAggregate: {
            __typename: 'PlausibleStatsAggregateResponse',
            visitors: {
              __typename: 'PlausibleStatsAggregateValue',
              value: 1
            }
          }
        }
      }
    }

    const journey = {
      id: 'journey.id'
    } as unknown as Journey

    render(
      <MockedProvider mocks={[getPlausibleJourneyQrCodeScansMock]}>
        <JourneyProvider value={{ journey }}>
          <ScanCount shortLinkId="shortLink.id" />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('1 scan')).toBeInTheDocument())
  })

  it('should render the scans count, plural', async () => {
    const getPlausibleJourneyQrCodeScansMock: MockedResponse<
      GetPlausibleJourneyQrCodeScans,
      GetPlausibleJourneyQrCodeScansVariables
    > = {
      request: {
        query: GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS,
        variables: {
          id: 'journey.id',
          filters: 'visit:utm_campaign==shortLink.id',
          date: '2024-06-01,2024-09-26'
        }
      },
      result: {
        data: {
          journeysPlausibleStatsAggregate: {
            __typename: 'PlausibleStatsAggregateResponse',
            visitors: {
              __typename: 'PlausibleStatsAggregateValue',
              value: 5
            }
          }
        }
      }
    }

    const journey = {
      id: 'journey.id'
    } as unknown as Journey

    render(
      <MockedProvider mocks={[getPlausibleJourneyQrCodeScansMock]}>
        <JourneyProvider value={{ journey }}>
          <ScanCount shortLinkId="shortLink.id" />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('5 scans')).toBeInTheDocument())
  })

  it('should show loading', () => {
    const getPlausibleJourneyQrCodeScansMock: MockedResponse<
      GetPlausibleJourneyQrCodeScans,
      GetPlausibleJourneyQrCodeScansVariables
    > = {
      request: {
        query: GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS,
        variables: {
          id: 'journey.id',
          filters: 'visit:utm_campaign==shortLink.id',
          date: '2024-06-01,2024-09-26'
        }
      },
      result: {
        data: {
          journeysPlausibleStatsAggregate: {
            __typename: 'PlausibleStatsAggregateResponse',
            visitors: {
              __typename: 'PlausibleStatsAggregateValue',
              value: 1
            }
          }
        }
      }
    }

    const journey = {
      id: 'journey.id'
    } as unknown as Journey

    render(
      <MockedProvider mocks={[getPlausibleJourneyQrCodeScansMock]}>
        <JourneyProvider value={{ journey }}>
          <ScanCount shortLinkId="shortLink.id" />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByLabelText('scan count loading')).toBeInTheDocument()
  })
})
