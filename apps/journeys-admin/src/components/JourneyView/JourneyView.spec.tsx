import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeName,
  ThemeMode,
  UserJourneyRole
} from '../../../__generated__/globalTypes'
import { USER_JOURNEY_OPEN, GET_USER_ROLE } from './JourneyView'
import { JourneyView } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('JourneyView', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    slug: 'my-journey',
    title: 'title',
    description: 'description',
    createdAt: '2021-11-19T12:34:56.647Z',
    blocks: [],
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
    publishedAt: null,
    status: JourneyStatus.draft,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    seoTitle: null,
    seoDescription: null,
    primaryImageBlock: null,
    template: null,
    userJourneys: [
      {
        __typename: 'UserJourney',
        id: 'userJourney1.id',
        role: UserJourneyRole.owner,
        openedAt: null,
        user: {
          __typename: 'User',
          id: 'user.id',
          firstName: 'firstName',
          lastName: 'lastName',
          imageUrl: null
        }
      }
    ]
  }

  it.skip('should have edit button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, admin: true }}>
            <JourneyView journeyType="Journey" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/journeyId/edit'
    )
  })
  it('should show reports', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, admin: true }}>
            <JourneyView journeyType="Journey" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('power-bi-report')).toBeInTheDocument()
    )
  })

  it('should update userJourney openedAt', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyOpen: {
          id: 'UserJourney1.id'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_USER_ROLE
            },
            result: {
              data: {
                getUserRole: {
                  __typename: 'UserRole',
                  id: '1',
                  roles: ['owner'],
                  userId: 'user.id'
                }
              }
            }
          },
          {
            request: {
              query: USER_JOURNEY_OPEN,
              variables: {
                id: journey.id
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey, admin: true }}>
            <JourneyView journeyType="Journey" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
