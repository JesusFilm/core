import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables,
  GetAllTeamHosts_hosts as Host
} from '../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../../../../../../__generated__/UpdateJourneyHost'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { UPDATE_JOURNEY_HOST } from '../../../../../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { GET_ALL_TEAM_HOSTS, HostTab } from './HostTab'

const user1 = { id: 'userId', email: 'admin@email.com' }

jest.mock('../../../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))

const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock

describe('HostTab', () => {
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

  const defaultHost: Host = {
    id: 'hostId',
    __typename: 'Host',
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

  const getTeamHostsMock: MockedResponse<
    GetAllTeamHosts,
    GetAllTeamHostsVariables
  > = {
    request: {
      query: GET_ALL_TEAM_HOSTS,
      variables: { teamId: journey?.team?.id ?? '' }
    },
    result: {
      data: {
        hosts: [
          {
            __typename: 'Host',
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

  const updateJourneyHostMock: MockedResponse<
    UpdateJourneyHost,
    UpdateJourneyHostVariables
  > = {
    request: {
      query: UPDATE_JOURNEY_HOST,
      variables: {
        id: journey.id,
        input: {
          hostId: null
        }
      }
    },
    result: {
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: journey.id,
          host: {
            __typename: 'Host',
            id: defaultHost.id
          }
        }
      }
    }
  }

  it('should render the default host tab', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).not.toBeDisabled()
    })
  })

  it('should disable editing hosts if no team on journey', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, team: null, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
    })
  })

  it('should disable editing hosts if current user does not have access', async () => {
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: { id: 'otherUser', email: 'otherUser@test.com' }
    })

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
    expect(getByText('Only My team members can edit this')).toBeInTheDocument()
  })

  it('should disable editing hosts if no users have access in team', async () => {
    const { getByRole, getByText } = render(
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
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
      expect(
        getByText('Cannot edit hosts for this old journey')
      ).toBeInTheDocument()
    })
  })

  it('should navigate to Host List', async () => {
    const { getAllByRole, getByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
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
      expect(getByText('Hosts')).toBeInTheDocument()
    })
  })

  it('should navigate to info', async () => {
    const { getAllByRole, getByText, getByTestId } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
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
      expect(getByText('Hosts')).toBeInTheDocument()
    })

    fireEvent.click(getByTestId('InformationCircleContainedIcon'))

    await waitFor(() => {
      expect(
        getByText('Why does your journey need a host?')
      ).toBeInTheDocument()
    })
  })

  it('should navigate to the edit host panel on host selection', async () => {
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

    const { getByRole, getByText } = render(
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
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).not.toBeDisabled()
    })
    fireEvent.click(getByRole('button', { name: 'Select a Host' }))

    await waitFor(() => {
      expect(getByText('Hosts')).toBeInTheDocument()
    })
    expect(getByRole('button', { name: 'Host1' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Host1' }))

    await waitFor(() => expect(result).toHaveBeenCalled())

    // Check navigated to edit host panel in E2E
  })

  it('should navigate to the create host panel', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getUserTeamMock, updateJourneyHostMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).not.toBeDisabled()
    })

    fireEvent.click(getByRole('button', { name: 'Select a Host' }))

    await waitFor(() => {
      expect(getByText('Hosts')).toBeInTheDocument()
    })

    fireEvent.click(getByRole('button', { name: 'Create New' }))

    await waitFor(() => {
      expect(getByText('Back')).toBeInTheDocument()
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

    const { getByRole, getByText } = render(
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
            <HostTab />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByText('Cru International')).toBeInTheDocument()
    })
    fireEvent.click(getByText('Cru International'))

    await waitFor(() => {
      expect(getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    })

    fireEvent.click(getByRole('button', { name: 'Clear' }))

    await waitFor(() => expect(result).toHaveBeenCalled())

    // Can check for select panel in E2E
  })
})
