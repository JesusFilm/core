import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { GetUserRole } from '@core/journeys/ui/useUserRoleQuery/__generated__/GetUserRole'

import { GetJourneyForSharing } from '../../../../../../__generated__/GetJourneyForSharing'
import {
  Role,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { GET_CUSTOM_DOMAINS } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { GET_JOURNEY_FOR_SHARING } from '../../../../../libs/useJourneyForShareLazyQuery/useJourneyForShareLazyQuery'

import { ShareItem } from './ShareItem'

jest.mock('../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

Object.assign(navigator, { clipboard: { writeText: jest.fn() } })

describe('ShareItem', () => {
  const journeyForSharingMock: MockedResponse<GetJourneyForSharing> = {
    request: {
      query: GET_JOURNEY_FOR_SHARING,
      variables: { id: 'journeyId' }
    },
    result: {
      data: {
        journey: {
          __typename: 'Journey',
          id: 'journeyId',
          slug: 'default',
          title: 'Journey Title',
          description: 'Journey Description',
          language: {
            __typename: 'Language',
            id: 'languageId',
            bcp47: 'en',
            iso3: 'eng',
            name: [
              {
                __typename: 'LanguageName',
                value: 'English',
                primary: true
              }
            ]
          },
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          primaryImageBlock: {
            __typename: 'ImageBlock',
            id: 'imageBlockId',
            parentBlockId: 'parentBlockId',
            parentOrder: 1,
            src: 'https://example.com/image.jpg',
            alt: 'Journey Image',
            width: 100,
            height: 100,
            blurhash: 'blurhash',
            scale: 1,
            focalTop: 0.5,
            focalLeft: 0.5
          },
          team: {
            __typename: 'Team',
            id: 'teamId',
            customDomains: [
              {
                __typename: 'CustomDomain',
                name: 'custom.domain.com'
              }
            ]
          }
        }
      }
    }
  }

  const push = jest.fn()
  const on = jest.fn()

  const getCustomDomainsMock = {
    request: {
      query: GET_CUSTOM_DOMAINS,
      variables: { teamId: 'teamId' }
    },
    result: {
      data: {
        customDomains: [
          {
            __typename: 'CustomDomain',
            id: 'customDomainId',
            name: 'custom.domain.com',
            apexName: 'custom.domain.com',
            journeyCollection: null
          }
        ]
      }
    }
  }

  let originalEnv

  beforeEach(() => {
    jest.clearAllMocks()
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'https://default.domain.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should open ShareDialog when Share button is clicked', () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[journeyForSharingMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" journey={defaultJourney} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Share This Journey')).toBeInTheDocument()
  })

  it('should handle edit journey slug navigation', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[journeyForSharingMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" journey={defaultJourney} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'edit-url' } },
        undefined,
        { shallow: true }
      )
    })

    expect(screen.getByRole('dialog', { name: 'Edit URL' })).toBeInTheDocument()
  })

  it('should handle embed journey navigation', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[journeyForSharingMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" journey={defaultJourney} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'embed-journey' } },
        undefined,
        { shallow: true }
      )
    })

    expect(
      screen.getByRole('dialog', { name: 'Embed journey' })
    ).toBeInTheDocument()
  })

  it('should handle QR code navigation', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    const getUserRoleMock: MockedResponse<GetUserRole> = {
      request: { query: GET_USER_ROLE },
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

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[getUserRoleMock, journeyForSharingMock]}>
          <Suspense>
            <JourneyProvider
              value={{ journey: defaultJourney, variant: 'admin' }}
            >
              <ShareItem variant="button" journey={defaultJourney} />
            </JourneyProvider>
          </Suspense>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'qr-code' } },
        undefined,
        { shallow: true }
      )
    })

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'QR Code'
      )
    )
  })

  it('should pass custom domain to ShareDialog', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    const journeyWithTeam = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'teamId',
        title: 'Test Team',
        publicTitle: 'Test Team Public'
      }
    }

    const teamMock = {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: {
        data: {
          teams: [
            {
              __typename: 'Team',
              id: 'teamId1',
              title: 'Team with custom domain',
              publicTitle: null,
              userTeams: [],
              customDomains: [
                {
                  __typename: 'CustomDomain',
                  id: 'customDomainId',
                  name: 'custom.domain.com'
                }
              ]
            }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'journeyProfileId',
            lastActiveTeamId: 'teamId1'
          }
        }
      }
    }

    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[teamMock, journeyForSharingMock, getCustomDomainsMock]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{ journey: journeyWithTeam, variant: 'admin' }}
            >
              <ShareItem variant="button" journey={journeyWithTeam} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const copyField = screen.getByDisplayValue(
      'https://custom.domain.com/default'
    )
    expect(copyField).toBeInTheDocument()
  })

  it('should close ShareDialog when clicking outside', () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[journeyForSharingMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" journey={defaultJourney} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
