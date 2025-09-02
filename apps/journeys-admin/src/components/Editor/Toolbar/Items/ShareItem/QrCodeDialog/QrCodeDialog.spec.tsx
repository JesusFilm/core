import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { formatISO } from 'date-fns'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetJourney_journey as Journey } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

import {
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables
} from '../../../../../../../__generated__/GetJourneyQrCodes'
import {
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
} from '../../../../../../../__generated__/GetPlausibleJourneyQrCodeScans'
import {
  QrCodeCreate,
  QrCodeCreateVariables
} from '../../../../../../../__generated__/QrCodeCreate'
import { QrCodeFields as QrCode } from '../../../../../../../__generated__/QrCodeFields'

import {
  GET_JOURNEY_QR_CODES,
  QR_CODE_CREATE,
  QrCodeDialog
} from './QrCodeDialog'
import { GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS } from './ScanCount/ScanCount'

jest.mock('date-fns', () => {
  return {
    ...jest.requireActual('date-fns'),
    formatISO: jest.fn()
  }
})

const mockFormatIso = formatISO as jest.MockedFunction<typeof formatISO>

const teamMock = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          __typename: 'Team',
          id: 'team.id',
          title: 'Test Team',
          publicTitle: 'Test Team Public',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'team.id'
      }
    }
  }
}

describe('QrCodeDialog', () => {
  beforeEach(() => {
    mockFormatIso.mockReturnValue('2024-09-26')
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const handleClose = jest.fn()
  const journey = {
    id: 'journey.id',
    team: {
      id: 'team.id'
    }
  } as unknown as Journey

  const qrCode: QrCode = {
    __typename: 'QrCode',
    id: 'qrCode.id',
    toJourneyId: 'journey.id',
    shortLink: {
      __typename: 'ShortLink',
      id: 'shortLink.id',
      domain: {
        __typename: 'ShortLinkDomain',
        hostname: 'localhost'
      },
      pathname: 'path',
      to: 'http://localhost:4100/journeySlug?utm_source=ns-qr-code&utm_campaign=$shortLink.id'
    }
  }

  const getJourneyQrCodesMock: MockedResponse<
    GetJourneyQrCodes,
    GetJourneyQrCodesVariables
  > = {
    request: {
      query: GET_JOURNEY_QR_CODES,
      variables: {
        where: {
          journeyId: 'journey.id'
        }
      }
    },
    result: {
      data: {
        qrCodes: [qrCode]
      }
    }
  }

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

  it('should render the dialog', async () => {
    render(
      <MockedProvider mocks={[getJourneyQrCodesMock]}>
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} journey={journey} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'QR Code'
      )
    })
  })

  it('should call onClose when close button is clicked', async () => {
    render(
      <MockedProvider mocks={[getJourneyQrCodesMock]}>
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} journey={journey} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(screen.getByTestId('CloseRoundedIcon')))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should show QR code for local', async () => {
    render(
      <MockedProvider
        mocks={[getJourneyQrCodesMock, getPlausibleJourneyQrCodeScansMock]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} journey={journey} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByLabelText('http://localhost:4100/path')
      ).toBeInTheDocument()
    )
  })

  it('should show QR code for deployment', async () => {
    const deployedQrCodesMock: MockedResponse<
      GetJourneyQrCodes,
      GetJourneyQrCodesVariables
    > = {
      ...getJourneyQrCodesMock,
      result: {
        data: {
          qrCodes: [
            {
              __typename: 'QrCode',
              id: 'qrCode.id',
              toJourneyId: 'journey.id',
              shortLink: {
                __typename: 'ShortLink',
                id: 'shortLink.id',
                domain: {
                  __typename: 'ShortLinkDomain',
                  hostname: 'shortLink.domain'
                },
                pathname: 'path',
                to: 'http://shortLink.domain/journeySlug?utm_source=ns-qr-code&utm_campaign=$shortLink.id'
              }
            }
          ]
        }
      }
    }

    render(
      <MockedProvider
        mocks={[deployedQrCodesMock, getPlausibleJourneyQrCodeScansMock]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} journey={journey} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByLabelText('https://shortLink.domain/path')
      ).toBeInTheDocument()
    )
  })

  it('should generate QrCode and add to cache', async () => {
    const getEmptyQrCodesMock: MockedResponse<
      GetJourneyQrCodes,
      GetJourneyQrCodesVariables
    > = {
      ...getJourneyQrCodesMock,
      result: jest.fn(() => ({
        data: {
          qrCodes: []
        }
      }))
    }
    const qrCodeCreateMock: MockedResponse<
      QrCodeCreate,
      QrCodeCreateVariables
    > = {
      request: {
        query: QR_CODE_CREATE,
        variables: {
          input: {
            journeyId: 'journey.id',
            teamId: 'team.id'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          qrCodeCreate: {
            ...qrCode
          }
        }
      }))
    }
    const cache = new InMemoryCache()

    render(
      <MockedProvider
        cache={cache}
        mocks={[getEmptyQrCodesMock, qrCodeCreateMock, teamMock]}
      >
        <Suspense>
          <TeamProvider>
            <JourneyProvider value={{ journey }}>
              <SnackbarProvider>
                <QrCodeDialog open onClose={handleClose} journey={journey} />
              </SnackbarProvider>
            </JourneyProvider>
          </TeamProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }))
    )
    await waitFor(() => expect(qrCodeCreateMock.result).toHaveBeenCalled())

    expect(
      cache.extract()?.ROOT_QUERY?.[
        'qrCodes({"where":{"journeyId":"journey.id"}})'
      ]
    ).toEqual([{ __ref: 'QrCode:qrCode.id' }])
  })

  it('should throw error if qr code creation failed', async () => {
    const getEmptyQrCodesMock: MockedResponse<
      GetJourneyQrCodes,
      GetJourneyQrCodesVariables
    > = {
      ...getJourneyQrCodesMock,
      result: jest.fn(() => ({
        data: {
          qrCodes: []
        }
      }))
    }
    const qrCodeCreateMock: MockedResponse<
      QrCodeCreate,
      QrCodeCreateVariables
    > = {
      request: {
        query: QR_CODE_CREATE,
        variables: {
          input: {
            journeyId: 'journey.id',
            teamId: 'team.id'
          }
        }
      },
      error: new Error('error')
    }

    render(
      <MockedProvider mocks={[getEmptyQrCodesMock, qrCodeCreateMock, teamMock]}>
        <Suspense>
          <TeamProvider>
            <JourneyProvider value={{ journey }}>
              <SnackbarProvider>
                <QrCodeDialog open onClose={handleClose} journey={journey} />
              </SnackbarProvider>
            </JourneyProvider>
          </TeamProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }))
    )
    await waitFor(() =>
      expect(screen.getByText('Failed to create QR Code')).toBeInTheDocument()
    )
  })
})
