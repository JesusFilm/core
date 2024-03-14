import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { HostTab } from './HostTab'

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
})
