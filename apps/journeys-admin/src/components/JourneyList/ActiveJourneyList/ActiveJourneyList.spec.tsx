import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User as AuthUser } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney, oldJourney } from '../journeyListData'

import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from './ActiveJourneyList'

import { ActiveJourneyList } from '.'

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
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const activeJourneysMock: MockedResponse = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          __typename: 'Team',
          userTeams: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

describe('ActiveJourneyList', () => {
  it('should ask users to add a new journey', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[noJourneysMock, getTeamsMock]}>
        <ThemeProvider>
          <TeamProvider>
            <SnackbarProvider>
              <ActiveJourneyList />
            </SnackbarProvider>
          </TeamProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No journeys to display.')).toBeInTheDocument()
    )
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')).toHaveLength(3)
    )
  })

  describe('Archive All', () => {
    it('should display the archive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Archive Journeys')).toBeInTheDocument()
    })

    const result = jest.fn(() => ({
      data: { journeysArchive: [{ id: defaultJourney.id, status: 'archived' }] }
    }))
    const archiveJourneysMock = {
      request: {
        query: ARCHIVE_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should archive all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            activeJourneysMock,
            archiveJourneysMock,
            noJourneysMock,
            getTeamsMock
          ]}
        >
          <ThemeProvider>
            <TeamProvider>
              <SnackbarProvider>
                <ActiveJourneyList
                  event="archiveAllActive"
                  authUser={{ id: 'user-id1' } as unknown as AuthUser}
                />
              </SnackbarProvider>
            </TeamProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Archive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            getTeamsMock,
            activeJourneysMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <ThemeProvider>
            <TeamProvider>
              <SnackbarProvider>
                <ActiveJourneyList
                  event="archiveAllActive"
                  authUser={{ id: 'user-id1' } as unknown as AuthUser}
                />
              </SnackbarProvider>
            </TeamProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Archive' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: { journeysTrash: [{ id: defaultJourney.id, status: 'archived' }] }
    }))
    const trashJourneysMock = {
      request: {
        query: TRASH_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="trashAllActive"
                authUser={{ id: 'user-id1' } as unknown as AuthUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Trash Journeys')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            activeJourneysMock,
            trashJourneysMock,
            noJourneysMock,
            getTeamsMock
          ]}
        >
          <ThemeProvider>
            <TeamProvider>
              <SnackbarProvider>
                <ActiveJourneyList
                  event="trashAllActive"
                  authUser={{ id: 'user-id1' } as unknown as AuthUser}
                />
              </SnackbarProvider>
            </TeamProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            getTeamsMock,
            activeJourneysMock,
            { ...trashJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <TeamProvider>
              <ThemeProvider>
                <SnackbarProvider>
                  <ActiveJourneyList
                    event="trashAllActive"
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
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
