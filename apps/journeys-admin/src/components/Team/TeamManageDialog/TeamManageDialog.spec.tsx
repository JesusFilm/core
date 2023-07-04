import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { TeamProvider, GET_TEAMS } from '../TeamProvider'
import { GetUserTeams } from '../../../../__generated__/GetUserTeams'
import { GetUserTeamInvites } from '../../../../__generated__/GetUserTeamInvites'
import { GetTeams } from '../../../../__generated__/GetTeams'
import {
  TeamManageDialog,
  GET_USER_TEAMS,
  GET_USER_TEAM_INVITES
} from './TeamManageDialog'

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
      ...user1
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
const user1 = { id: 'userId', email: 'siyangguccigang@gmail.com' }

const handleClose = jest.fn()
beforeEach(() => {
  handleClose.mockClear()
  ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
})

describe('TeamManageDialog', () => {
  const getUserTeamMock1: MockedResponse<GetUserTeams> = {
    request: {
      query: GET_USER_TEAMS,
      variables: { teamId: 'jfp-team' }
    },
    result: {
      data: {
        userTeams: [
          {
            id: 'userTeamId',
            __typename: 'UserTeam',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              email: 'siyangguccigang@gmail.com',
              firstName: 'Siyang',
              id: 'userId',
              imageUrl: 'imageURL',
              lastName: 'Gang'
            }
          }
        ]
      }
    }
  }

  const getUserTeamInvitesMockedResponse1: MockedResponse<GetUserTeamInvites> =
    {
      request: {
        query: GET_USER_TEAM_INVITES,
        variables: { teamId: 'jfp-team' }
      },
      result: {
        data: {
          userTeamInvites: [
            {
              id: 'inviteId',
              email: 'edmond@gmail.com',
              teamId: 'teamId',
              __typename: 'UserTeamInvite'
            }
          ]
        }
      }
    }

  const getTeams: MockedResponse<GetTeams> = {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'jfp-team', title: 'Team Title', __typename: 'Team' }]
      }
    }
  }

  const mocks = [getUserTeamMock1, getUserTeamInvitesMockedResponse1, getTeams]
  it('renders without error', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <TeamManageDialog open onClose={handleClose} />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByText('Members')).toBeInTheDocument()
      expect(getByText('Siyang Gang')).toBeInTheDocument()
      expect(getByText('edmond@gmail.com')).toBeInTheDocument()
      expect(getByText('Invite others to your team')).toBeInTheDocument()
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
