import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'

import { CreateJourneyButton } from './CreateJourneyButton'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'Template',
  description: 'Description',
  template: true,
  slug: 'default',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  status: JourneyStatus.published,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: '2021-11-19T12:34:56.647Z',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  tags: []
}

const teamResult = jest.fn(() => ({
  data: {
    teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
    getJourneyProfile: {
      __typename: 'JourneyProfile',
      lastActiveTeamId: 'teamId'
    }
  }
}))

const setOpenTeamDialogMock = jest.fn()

const createJourneyButton = (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
        },
        result: teamResult
      }
    ]}
  >
    <JourneyProvider value={{ journey }}>
      <CreateJourneyButton
        openTeamDialog={false}
        setOpenTeamDialog={setOpenTeamDialogMock}
      />
    </JourneyProvider>
  </MockedProvider>
)

describe('CreateJourneyButton', () => {
  const originalWindow = window
  afterAll(() => {
    window = originalWindow
  })

  it('should open team dialog if url query set to createNew', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: 'true' }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          }
        ]}
      >
        <CreateJourneyButton
          signedIn
          openTeamDialog={false}
          setOpenTeamDialog={setOpenTeamDialogMock}
        />
      </MockedProvider>
    )

    expect(setOpenTeamDialogMock).toHaveBeenCalledWith(true)
  })

  it('should open team dialog on button click if signed in', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <CreateJourneyButton
            signedIn
            openTeamDialog={false}
            setOpenTeamDialog={setOpenTeamDialogMock}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    expect(setOpenTeamDialogMock).toHaveBeenCalledWith(true)
  })

  describe('if not signed in', () => {
    const prefetch = jest.fn()
    const push = jest.fn().mockResolvedValueOnce('')

    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false },
        asPath: '/templates/[journeyId]'
      } as unknown as NextRouter)

      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: true,
        value: { origin: 'http://localhost:4200' },
        writable: true
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should pre-render sign in page', async () => {
      render(createJourneyButton)

      await waitFor(() => {
        expect(prefetch).toHaveBeenCalledWith('/users/sign-in')
      })
    })

    it('should open account check dialog and redirect to sign in page when login is clicked', async () => {
      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Login with my account' }))

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: '/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/[journeyId]?createNew=true',
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog and redirect to sign in page when create account is clicked', async () => {
      const { getByRole } = render(createJourneyButton)

      fireEvent.click(getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(getByRole('button', { name: 'Create a new account' }))

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: '/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/[journeyId]?createNew=true',
              login: false
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    describe('if domain environment variable set', () => {
      const originalEnv = process.env

      beforeAll(() => {
        process.env = {
          ...originalEnv,
          NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
        }
      })

      afterAll(() => {
        process.env = originalEnv
      })

      describe('if viewing within journeys admin', () => {
        beforeEach(() => {
          mockUseRouter.mockReturnValue({
            prefetch,
            push,
            query: { createNew: false },
            asPath: '/templates/[journeyId]'
          } as unknown as NextRouter)

          Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: { origin: 'http://localhost:4200' },
            writable: true
          })
        })

        it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
          const { getByRole } = render(createJourneyButton)

          fireEvent.click(getByRole('button', { name: 'Use This Template' }))
          fireEvent.click(
            getByRole('button', { name: 'Login with my account' })
          )

          await waitFor(() => {
            expect(push).toHaveBeenCalledWith(
              {
                pathname: 'http://localhost:4200/users/sign-in',
                query: {
                  redirect:
                    'http://localhost:4200/templates/[journeyId]?createNew=true',
                  login: true
                }
              },
              undefined,
              { shallow: true }
            )
          })
        })

        it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
          const { getByRole } = render(createJourneyButton)

          fireEvent.click(getByRole('button', { name: 'Use This Template' }))
          fireEvent.click(getByRole('button', { name: 'Create a new account' }))

          await waitFor(() => {
            expect(push).toHaveBeenCalledWith(
              {
                pathname: 'http://localhost:4200/users/sign-in',
                query: {
                  redirect:
                    'http://localhost:4200/templates/[journeyId]?createNew=true',
                  login: false
                }
              },
              undefined,
              { shallow: true }
            )
          })
        })
      })

      describe('if viewing from another project', () => {
        beforeEach(() => {
          mockUseRouter.mockReturnValue({
            prefetch,
            push,
            query: { createNew: false },
            asPath: '/journeys/[journeyId]'
          } as unknown as NextRouter)

          Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: { origin: 'http://localhost:4300' },
            writable: true
          })
        })

        it('should open account check dialog and still redirect to sign in page when login is clicked', async () => {
          const { getByRole } = render(createJourneyButton)

          fireEvent.click(getByRole('button', { name: 'Use This Template' }))
          fireEvent.click(
            getByRole('button', { name: 'Login with my account' })
          )

          await waitFor(() => {
            expect(push).toHaveBeenCalledWith(
              {
                pathname: 'http://localhost:4200/users/sign-in',
                query: {
                  redirect:
                    'http://localhost:4300/journeys/[journeyId]?createNew=true',
                  login: true
                }
              },
              undefined,
              { shallow: true }
            )
          })
        })

        it('should open account check dialog and still redirect to sign in page when create account is clicked', async () => {
          const { getByRole } = render(createJourneyButton)

          fireEvent.click(getByRole('button', { name: 'Use This Template' }))
          fireEvent.click(getByRole('button', { name: 'Create a new account' }))

          await waitFor(() => {
            expect(push).toHaveBeenCalledWith(
              {
                pathname: 'http://localhost:4200/users/sign-in',
                query: {
                  redirect:
                    'http://localhost:4300/journeys/[journeyId]?createNew=true',
                  login: false
                }
              },
              undefined,
              { shallow: true }
            )
          })
        })
      })
    })
  })

  it('should disable button while loading', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          }
        ]}
      >
        <TeamProvider>
          <JourneyProvider value={{}}>
            <CreateJourneyButton
              signedIn
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
    )
  })
})
