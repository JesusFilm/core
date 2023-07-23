import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { AuthUser } from 'next-firebase-auth'
import { defaultJourney, oldJourney } from '../journeyListData'
import { ThemeProvider } from '../../ThemeProvider'
import { SortOrder } from '../JourneySort'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GetTeams } from '../../../../__generated__/GetTeams'
import { GET_TEAMS, TeamProvider } from '../../Team/TeamProvider'
import {
  RESTORE_TRASHED_JOURNEYS,
  DELETE_TRASHED_JOURNEYS
} from './TrashedJourneyList'
import { TrashedJourneyList } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const trashedJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      journeys: [
        { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
        { ...oldJourney, trashedAt: '2021-12-07T03:22:41.135Z' }
      ]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const getTeams: MockedResponse<GetTeams> = {
  request: {
    query: GET_TEAMS
  },
  result: {
    data: {
      teams: []
    }
  }
}

describe('TrashedJourneyList', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-12-11'))
  })

  it('should render journeys in descending createdAt date by default', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
      }
    })
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[trashedJourneysMock, { ...getTeams, result }]}>
        <ThemeProvider>
          <TeamProvider>
            <SnackbarProvider>
              <TrashedJourneyList />
            </SnackbarProvider>
          </TeamProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'January 1'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'November 19, 2020'
    )
  })

  it('should order journeys in alphabetical order', async () => {
    const result = jest.fn().mockReturnValueOnce({
      data: {
        teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
      }
    })
    const trashedLowerCaseJourneyTitle = {
      ...defaultJourney,
      title: 'a lower case title',
      trashedAt: '2021-12-07T03:22:41.135Z'
    }
    const trashedOldJourney = {
      ...oldJourney,
      trashedAt: '2021-12-07T03:22:41.135Z'
    }
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                teamId: 'teamId'
              }
            },
            result: {
              data: {
                journeys: [trashedLowerCaseJourneyTitle, trashedOldJourney]
              }
            }
          },
          { ...getTeams, result }
        ]}
      >
        <ThemeProvider>
          <TeamProvider>
            <SnackbarProvider>
              <TrashedJourneyList sortOrder={SortOrder.TITLE} />
            </SnackbarProvider>
          </TeamProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case titleJanuary 1, 2023DraftEnglish'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Journey HeadingNovember 19, 2020 - Journey created before the current year should also show the year in the datePublishedEnglish'
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
                status: [JourneyStatus.trashed]
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

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')).toHaveLength(3)
    )
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

    it('should display the restore all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Restore Journeys')).toBeInTheDocument()
    })

    it('should restore all journeys', async () => {
      const result = jest.fn().mockReturnValueOnce({
        data: {
          teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
        }
      })
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            restoreJourneysMock,
            noJourneysMock,
            { ...getTeams, result }
          ]}
        >
          <ThemeProvider>
            <TeamProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="restoreAllTrashed"
                  authUser={{ id: 'user-id1' } as unknown as AuthUser}
                />
              </SnackbarProvider>
            </TeamProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Restore'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const result = jest.fn().mockReturnValueOnce({
        data: {
          teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
        }
      })
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...restoreJourneysMock, error: new Error('error') },
            { ...getTeams, result }
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <ThemeProvider>
                <SnackbarProvider>
                  <TrashedJourneyList
                    event="restoreAllTrashed"
                    authUser={{ id: 'user-id1' } as unknown as AuthUser}
                  />
                </SnackbarProvider>
              </ThemeProvider>
            </TeamProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Restore'))
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

    it('should display the delete all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const result = jest.fn().mockReturnValueOnce({
        data: {
          teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
        }
      })
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            deleteJourneysMock,
            noJourneysMock,
            { ...getTeams, result }
          ]}
        >
          <ThemeProvider>
            <TeamProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="deleteAllTrashed"
                  authUser={{ id: 'user-id1' } as unknown as AuthUser}
                />
              </SnackbarProvider>
            </TeamProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const result = jest.fn().mockReturnValueOnce({
        data: {
          teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }]
        }
      })
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...deleteJourneysMock, error: new Error('error') },
            { ...getTeams, result }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <TeamProvider>
                <SnackbarProvider>
                  <TrashedJourneyList
                    event="deleteAllTrashed"
                    authUser={{ id: 'user-id1' } as unknown as AuthUser}
                  />
                </SnackbarProvider>
              </TeamProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
