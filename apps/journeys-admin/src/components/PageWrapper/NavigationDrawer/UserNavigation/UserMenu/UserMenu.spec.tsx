import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import { UserMenu } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('UserMenu', () => {
  const handleProfileClose = jest.fn()
  const signOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

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
              emailVerified: true,
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
    expect(getByText('Email Preferences')).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Email Preferences' })
    ).toBeInTheDocument()
  })

  it('should redirect user to email preferences page', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByText } = render(
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
              emailVerified: true,
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

    fireEvent.click(getByText('Email Preferences'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/email-preferences/amin@email.com')
    )
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
              userTeams: [],
              customDomains: []
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
                emailVerified: true,
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

  it('should open language selector', async () => {
    const { getByText } = render(
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
              emailVerified: true,
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

    fireEvent.click(getByText('Language'))
    await waitFor(() =>
      expect(getByText('Change Language')).toBeInTheDocument()
    )
  })
})
