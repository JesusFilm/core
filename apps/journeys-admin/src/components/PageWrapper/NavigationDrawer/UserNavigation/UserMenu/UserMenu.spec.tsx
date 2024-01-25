import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../../../Team/TeamProvider'

import { UserMenu } from '.'

describe('UserMenu', () => {
  const handleProfileClose = jest.fn()
  const signOut = jest.fn()

  it('should render the menu', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserMenu
            apiUser={{
              __typename: 'User',
              id: 'userId',
              firstName: 'Amin',
              lastName: 'One',
              imageUrl: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              superAdmin: false
            }}
            profileOpen
            profileAnchorEl={null}
            handleProfileClose={handleProfileClose}
            user={
              {
                displayName: 'Amin One',
                photoURL: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                signOut
              } as unknown as User
            }
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    expect(getByText('amin@email.com')).toBeInTheDocument()
    expect(getByText('Language')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument()
  })

  it('should call signOut on logout click', async () => {
    const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: jest.fn(() => ({
        data: {
          teams: [
            {
              id: 'teamId',
              title: 'Team Title',
              publicTitle: null,
              __typename: 'Team',
              userTeams: []
            }
          ],
          getJourneyProfile: {
            __typename: 'JourneyProfile',
            id: 'journeyProfileId',
            lastActiveTeamId: 'teamId'
          }
        }
      }))
    }
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeams]}>
        <SnackbarProvider>
          <TeamProvider>
            <UserMenu
              apiUser={{
                __typename: 'User',
                id: 'userId',
                firstName: 'Amin',
                lastName: 'One',
                imageUrl: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                superAdmin: false
              }}
              profileOpen
              profileAnchorEl={null}
              handleProfileClose={handleProfileClose}
              user={
                {
                  displayName: 'Amin One',
                  photoURL: 'https://bit.ly/3Gth4Yf',
                  email: 'amin@email.com',
                  signOut
                } as unknown as User
              }
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
    await waitFor(() =>
      expect(getByText('Logout successful')).toBeInTheDocument()
    )
    expect(getTeams.result).toHaveBeenCalled()
  })
})
