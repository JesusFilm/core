import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act, Suspense } from 'react'
import { formatISO } from 'date-fns'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import {
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables
} from '../../../../../../../__generated__/GetJourneyQrCodes'
import { useCurrentUserLazyQuery } from '../../../../../../libs/useCurrentUserLazyQuery'
import {
  GET_JOURNEY_QR_CODES,
  QR_CODE_CREATE,
  QR_CODE_UPDATE,
  QrCodeDialog
} from './QrCodeDialog'
import { GetUserRole } from '@core/journeys/ui/useUserRoleQuery/__generated__/GetUserRole'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import {
  Role,
  UserJourneyRole,
  UserTeamRole
} from 'libs/journeys/ui/__generated__/globalTypes'
import { SnackbarProvider } from 'notistack'
import { GET_USER_PERMISSIONS } from './CodeDestination/CodeDestination'
import {
  GetUserPermissions,
  GetUserPermissionsVariables
} from '../../../../../../../__generated__/GetUserPermissions'
import {
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
} from '../../../../../../../__generated__/GetPlausibleJourneyQrCodeScans'
import { GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS } from './ScanCount/ScanCount'
import { InMemoryCache } from '@apollo/client'
import {
  QrCodeCreate,
  QrCodeCreateVariables
} from '../../../../../../../__generated__/QrCodeCreate'
import { QrCodeFields as QrCode } from '../../../../../../../__generated__/QrCodeFields'
import {
  QrCodeUpdate,
  QrCodeUpdateVariables
} from '../../../../../../../__generated__/QrCodeUpdate'

jest.mock('../../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))
const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock
const user = { id: 'user.id', email: 'test@email.com' }

jest.mock('date-fns', () => {
  return {
    ...jest.requireActual('date-fns'),
    formatISO: jest.fn()
  }
})

const mockFormatIso = formatISO as jest.MockedFunction<typeof formatISO>

describe('QrCodeDialog', () => {
  beforeEach(() => {
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: user
    })
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

  const getUserRoleMock: MockedResponse<GetUserRole> = {
    request: {
      query: GET_USER_ROLE
    },
    result: jest.fn(() => ({
      data: {
        getUserRole: {
          __typename: 'UserRole',
          id: 'user.id',
          roles: [Role.publisher]
        }
      }
    }))
  }

  const getUserPermissionsMock: MockedResponse<
    GetUserPermissions,
    GetUserPermissionsVariables
  > = {
    request: {
      query: GET_USER_PERMISSIONS,
      variables: {
        id: 'journey.id'
      }
    },
    result: jest.fn(() => ({
      data: {
        adminJourney: {
          __typename: 'Journey',
          id: 'journey.id',
          template: true,
          team: {
            __typename: 'Team',
            id: 'team.id',
            userTeams: [
              {
                __typename: 'UserTeam',
                id: 'userTeam.id',
                role: UserTeamRole.manager,
                user: {
                  __typename: 'User',
                  email: 'test@email.com'
                }
              }
            ]
          },
          userJourneys: [
            {
              __typename: 'UserJourney',
              id: 'userJourney.id',
              role: UserJourneyRole.owner,
              user: {
                __typename: 'User',
                email: 'test@email.com'
              }
            }
          ]
        }
      }
    }))
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
      <MockedProvider
        mocks={[getJourneyQrCodesMock, getUserRoleMock, getUserPermissionsMock]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
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
      <MockedProvider
        mocks={[getJourneyQrCodesMock, getUserRoleMock, getUserPermissionsMock]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
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
        mocks={[
          getJourneyQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          getPlausibleJourneyQrCodeScansMock
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
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
        mocks={[
          deployedQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          getPlausibleJourneyQrCodeScansMock
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
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
        query: QR_CODE_CREATE
      },
      variableMatcher: () => true,
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
        mocks={[
          getEmptyQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          qrCodeCreateMock
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
            </SnackbarProvider>
          </JourneyProvider>
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
        query: QR_CODE_CREATE
      },
      variableMatcher: () => true,
      error: new Error('error')
    }

    render(
      <MockedProvider
        mocks={[
          getEmptyQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          qrCodeCreateMock
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
            </SnackbarProvider>
          </JourneyProvider>
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

  it('should update QrCode', async () => {
    const qrCodeUpdate: MockedResponse<QrCodeUpdate, QrCodeUpdateVariables> = {
      request: {
        query: QR_CODE_UPDATE
      },
      variableMatcher: () => true,
      result: jest.fn(() => ({
        data: {
          qrCodeUpdate: {
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
              to: 'http://localhost:4100/newUrl?utm_source=ns-qr-code&utm_campaign=$shortLink.id'
            }
          }
        }
      }))
    }
    render(
      <MockedProvider
        mocks={[
          getJourneyQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          getPlausibleJourneyQrCodeScansMock,
          qrCodeUpdate
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    await waitFor(() => expect(qrCodeUpdate.result).toHaveBeenCalled())
  })

  it('should throw error if qr code update failed', async () => {
    const qrCodeUpdate: MockedResponse<QrCodeUpdate, QrCodeUpdateVariables> = {
      request: {
        query: QR_CODE_UPDATE
      },
      variableMatcher: () => true,
      error: new Error('error')
    }
    render(
      <MockedProvider
        mocks={[
          getJourneyQrCodesMock,
          getUserRoleMock,
          getUserPermissionsMock,
          getPlausibleJourneyQrCodeScansMock,
          qrCodeUpdate
        ]}
      >
        <Suspense>
          <JourneyProvider value={{ journey }}>
            <SnackbarProvider>
              <QrCodeDialog open onClose={handleClose} />
            </SnackbarProvider>
          </JourneyProvider>
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    await waitFor(() =>
      expect(
        screen.getByText('Failed to update QR Code, make sure new URL is valid')
      ).toBeInTheDocument()
    )
  })
})
