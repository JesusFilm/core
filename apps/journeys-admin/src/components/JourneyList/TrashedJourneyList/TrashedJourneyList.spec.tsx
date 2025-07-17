import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney, fakeDate, oldJourney } from '../journeyListData'
import { SortOrder } from '../JourneySort'

import {
  DELETE_TRASHED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS
} from './TrashedJourneyList'

import { TrashedJourneyList } from '.'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const trashedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          trashedAt: '2021-12-07T03:22:41.135Z',
          status: JourneyStatus.trashed
        },
        {
          ...oldJourney,
          trashedAt: '2021-12-07T03:22:41.135Z',
          status: JourneyStatus.trashed
        }
      ]
    }
  }
}

const noJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('TrashedJourneyList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render journeys in descending updatedAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[trashedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        '11 months ago'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      '1 year ago'
    )
  })

  it('should order journeys in alphabetical order', async () => {
    const trashedLowerCaseJourneyTitle = {
      ...defaultJourney,
      title: 'a lower case title',
      trashedAt: '2021-12-07T03:22:41.135Z',
      status: JourneyStatus.trashed
    }
    const trashedOldJourney = {
      ...oldJourney,
      trashedAt: '2021-12-07T03:22:41.135Z',
      status: JourneyStatus.trashed
    }
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                useLastActiveTeamId: true
              }
            },
            result: {
              data: {
                journeys: [trashedLowerCaseJourneyTitle, trashedOldJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case titleEnglish•11 months ago00'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Journey HeadingEnglish•1 year ago00'
    )
  })

  it('should exclude journeys older than 40 days', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                useLastActiveTeamId: true
              }
            },
            result: {
              data: {
                journeys: [
                  { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldJourney, trashedAt: '2021-10-31T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'Default Journey Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1]).toBeUndefined()
  })

  describe('Restore All', () => {
    const result = jest.fn(() => ({
      data: [{ id: defaultJourney.id, status: 'published' }]
    }))
    const restoreJourneysMock = {
      request: {
        query: RESTORE_TRASHED_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the restore all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Restore Journeys')).toBeInTheDocument()
      )
    })

    it('should restore all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, restoreJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList
                event="restoreAllTrashed"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Restore' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...restoreJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="restoreAllTrashed"
                  user={{ id: 'user-id1' } as unknown as User}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Restore' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Delete All', () => {
    const result = jest.fn(() => ({
      data: [{ id: defaultJourney.id, status: 'deleted' }]
    }))
    const deleteJourneysMock = {
      request: {
        query: DELETE_TRASHED_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the delete all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
      )
    })

    it('should trash all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, deleteJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList
                event="deleteAllTrashed"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...deleteJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="deleteAllTrashed"
                  user={{ id: 'user-id1' } as unknown as User}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
