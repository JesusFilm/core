import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import TagManager from 'react-gtm-module'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'

import { CreateJourneyButton } from './CreateJourneyButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

describe('CreateJourneyButton', () => {
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

  it('should open team dialog if url query set to createNew', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: 'true' }
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
        <CreateJourneyButton signedIn />
      </MockedProvider>
    )

    expect(
      getByRole('dialog', { name: 'Add Journey to Team' })
    ).toBeInTheDocument()
  })

  it('should open team dialog on button click if signed in', () => {
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
          <CreateJourneyButton signedIn />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    expect(
      getByRole('dialog', { name: 'Add Journey to Team' })
    ).toBeInTheDocument()
  })

  it('should redirect to sign in page on button click if not signed in', async () => {
    const prefetch = jest.fn()
    const push = jest.fn().mockResolvedValueOnce('')
    mockUseRouter.mockReturnValue({
      prefetch,
      push,
      query: { createNew: false },
      asPath: '/templates/[journeyId]'
    } as unknown as NextRouter)

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { origin: 'http://localhost:4200' }
    })

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
          <CreateJourneyButton />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(prefetch).toHaveBeenCalledWith('/users/sign-in')
    })

    expect(
      getByRole('button', { name: 'Use This Template' })
    ).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          pathname: '/users/sign-in',
          query: {
            redirect:
              'http://localhost:4200/templates/[journeyId]?createNew=true'
          }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should create journey from template and redirect on dialog submit', async () => {
    const push = jest.fn().mockResolvedValueOnce('')
    mockUseRouter.mockReturnValue({
      push,
      query: { createNew: false }
    } as unknown as NextRouter)

    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: teamResult
          },
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
                teamId: 'teamId'
              }
            },
            result
          }
        ]}
      >
        <TeamProvider>
          <JourneyProvider value={{ journey }}>
            <CreateJourneyButton signedIn />
          </JourneyProvider>
        </TeamProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() => expect(teamResult).toHaveBeenCalled())

    expect(
      getByRole('button', { name: 'Select Team Team Name' })
    ).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'template_use',
          journeyId: 'journeyId',
          journeyTitle: 'Template'
        }
      })
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should disable button while loading', async () => {
    mockUseRouter.mockReturnValue({
      query: { createNew: false }
    } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <TeamProvider>
          <JourneyProvider value={{}}>
            <CreateJourneyButton signedIn />
          </JourneyProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
    )
  })
})
