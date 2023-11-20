import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { UPDATE_JOURNEY_HOST } from './HostForm/HostTitleFieldForm/HostTitleFieldForm'
import { GET_ALL_TEAM_HOSTS, HostSidePanel } from './HostSidePanel'

const user1 = { id: 'userId', email: 'admin@email.com' }

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('../../../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))

const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock

describe('HostSidePanel', () => {
  beforeEach(() => {
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: user1
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const userTeam: UserTeam = {
    id: 'teamId',
    __typename: 'UserTeam',
    role: UserTeamRole.manager,
    user: {
      __typename: 'User',
      email: user1.email,
      firstName: 'User',
      id: user1.id,
      imageUrl: 'imageURL',
      lastName: '1'
    }
  }

  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: userTeam.id,
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'imageSrc1',
    src2: 'imageSrc2'
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: userTeam.id, title: 'My team' },
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'Translation'
        }
      ]
    }
  } as unknown as Journey

  const getUserTeamMock: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: userTeam.id,
        where: { role: [UserTeamRole.manager, UserTeamRole.member] }
      }
    },
    result: {
      data: {
        userTeams: [userTeam],
        userTeamInvites: []
      }
    }
  }

  const getTeamHostsMock = {
    request: {
      query: GET_ALL_TEAM_HOSTS,
      variables: { teamId: journey?.team?.id }
    },
    result: {
      data: {
        hosts: [
          {
            id: 'host1.id',
            location: '',
            src1: null,
            src2: null,
            title: 'Host1'
          }
        ]
      }
    }
  }

  it('should render the default host side panel', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })
  })

  it('should disable editing hosts if no team on journey', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, team: null, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
    })
  })

  it('should disable editing hosts if current user does not have access', async () => {
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: { id: 'otherUser', email: 'otherUser@test.com' }
    })

    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
      expect(
        getAllByText('Only My team members can edit this')[0]
      ).toBeInTheDocument()
    })
  })

  it('should disable editing hosts if no users have access in team', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider
        mocks={[
          {
            ...getUserTeamMock,
            result: { data: { userTeams: [], userTeamInvites: [] } }
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
      expect(
        getAllByText('Cannot edit hosts for this old journey')[0]
      ).toBeInTheDocument()
    })
  })

  it('should navigate to the select host side panel', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })
  })

  it('should navigate to the info side panel', async () => {
    const { getAllByRole, getAllByText, getAllByTestId } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })

    fireEvent.click(getAllByTestId('info')[0])

    await waitFor(() => {
      expect(getAllByText('Information')[0]).toBeInTheDocument()
    })
  })

  it('should render the edit host panel', async () => {
    const { getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getAllByText('Edit Author')[0]).toBeInTheDocument()
    })
  })

  it('should navigate the edit host panel on host selection', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: 'host1.id'
          }
        }
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          getUserTeamMock,
          getTeamHostsMock,
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: 'host1.id'
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: { ...journey, host: null }, variant: 'admin' }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByRole('button', { name: 'Host1' })[0]).toBeInTheDocument()
    })
    fireEvent.click(getAllByRole('button', { name: 'Host1' })[0])

    await waitFor(() => expect(result).toHaveBeenCalled())

    // Check navigated to edit host panel in E2E
  })

  it('should navigate to the create host panel', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Create New' })[0])

    await waitFor(() => {
      expect(getAllByText('Create Author')[0]).toBeInTheDocument()
    })
  })

  it('should navigate the select host panel on host clearance', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: null
          }
        }
      }
    }))

    const { getAllByRole, getAllByText } = render(
      <MockedProvider
        mocks={[
          getUserTeamMock,
          getTeamHostsMock,
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: null
                }
              }
            },
            result
          },
          {
            request: {
              query: GET_ALL_TEAM_HOSTS,
              variables: { teamId: journey?.team?.id }
            },
            result: {
              data: {
                hosts: []
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getAllByText('Edit Author')[0]).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Clear' })[0])

    await waitFor(() => expect(result).toHaveBeenCalled())

    // Can check for select panel in E2E
  })
})
