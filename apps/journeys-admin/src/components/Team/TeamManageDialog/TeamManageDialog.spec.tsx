import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GetUserTeamsAndInvites } from '../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TeamManageDialog } from './TeamManageDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../../libs/useCurrentUser', () => ({
  __esModule: true,
  useCurrentUser: jest.fn().mockReturnValue({
    loadUser: jest.fn(),
    data: {
      __typename: 'User',
      id: 'userId',
      email: 'miguelohara@example.com'
    }
  })
}))
jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('TeamManageDialog', () => {
  const handleClose = jest.fn()

  beforeEach(() => {
    handleClose.mockClear()
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: 'teamId',
        where: { role: [UserTeamRole.manager, UserTeamRole.member] }
      }
    },
    result: {
      data: {
        userTeams: [
          {
            __typename: 'UserTeam',
            id: 'userTeamId',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              email: 'miguelohara@example.com',
              firstName: 'Miguel',
              id: 'userId',
              imageUrl: 'https://example.com/image.jpg',
              lastName: "O'Hara"
            }
          }
        ],
        userTeamInvites: [
          {
            id: 'inviteId',
            email: 'edmond@example.com',
            teamId: 'teamId',
            __typename: 'UserTeamInvite'
          }
        ]
      }
    }
  }

  const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

  const mocks = [getUserTeamMock1, getTeams]

  it('renders without error', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <TeamManageDialog open onClose={handleClose} />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Manage Members')).toBeInTheDocument()
      expect(getByText("Miguel O'Hara")).toBeInTheDocument()
      expect(getByText('edmond@example.com')).toBeInTheDocument()
      expect(getByText('Invite team member')).toBeInTheDocument()
    })
  })

  it('should call on close', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <TeamProvider>
          <TeamManageDialog open onClose={handleClose} />
        </TeamProvider>
      </MockedProvider>
    )
    await act(async () => {
      fireEvent.click(getByTestId('dialog-close-button'))
      expect(handleClose).toHaveBeenCalled()
    })
  })
})
