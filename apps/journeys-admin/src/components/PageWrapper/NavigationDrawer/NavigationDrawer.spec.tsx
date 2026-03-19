import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Suspense } from 'react'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import { GetMe } from '../../../../__generated__/GetMe'
import { GetUserRole } from '../../../../__generated__/GetUserRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { User } from '../../../libs/auth/authContext'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'

import { GET_ME } from './UserNavigation'

import { NavigationDrawer } from '.'

describe('NavigationDrawer', () => {
  it('should show toggle and call onClose with false when open', async () => {
    const handleClose = jest.fn()
    render(<NavigationDrawer open onClose={handleClose} />)
    fireEvent.click(screen.getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(false)
  })

  it('should show toggle and call onClose with false when not open', async () => {
    const handleClose = jest.fn()
    render(<NavigationDrawer onClose={handleClose} />)
    fireEvent.click(screen.getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(true)
  })

  it('should show selected projects link when selected page empty', async () => {
    render(<NavigationDrawer open selectedPage="" />)
    expect(screen.getByTestId('NavigationListItemProjects')).toHaveClass(
      'Mui-selected'
    )
    expect(screen.getByTestId('NavigationListItemProjects')).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('should show selected projects link when selected page journeys', async () => {
    render(<NavigationDrawer open selectedPage="journeys" />)
    expect(screen.getByTestId('NavigationListItemProjects')).toHaveClass(
      'Mui-selected'
    )
    expect(screen.getByTestId('NavigationListItemProjects')).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('should show selected templates link when selected page templates', async () => {
    render(
      <NavigationDrawer open onClose={jest.fn()} selectedPage="templates" />
    )
    expect(screen.getByTestId('NavigationListItemTemplates')).toHaveClass(
      'Mui-selected'
    )
    expect(screen.getByTestId('NavigationListItemTemplates')).toHaveAttribute(
      'href',
      '/templates'
    )
  })

  describe('UserNavigation', () => {
    const user = {
      id: 'userId',
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com',
      phoneNumber: null,
      emailVerified: true,
      token: 'mock-token',
      isAnonymous: false
    } as unknown as User

    const getMeMock: MockedResponse<GetMe> = {
      request: {
        query: GET_ME,
        variables: { input: { redirect: undefined } }
      },
      result: {
        data: {
          me: {
            id: 'userId',
            firstName: 'Amin',
            lastName: 'One',
            imageUrl: 'https://bit.ly/3Gth4Yf',
            email: 'amin@email.com',
            superAdmin: true,
            emailVerified: true,
            __typename: 'AuthenticatedUser'
          }
        }
      }
    }

    const getUserRoleMock: MockedResponse<GetUserRole> = {
      request: {
        query: GET_USER_ROLE
      },
      result: {
        data: {
          getUserRole: {
            id: 'userId',
            roles: [Role.publisher],
            __typename: 'UserRole'
          }
        }
      }
    }

    const getAdminJourneysMock: MockedResponse<
      GetAdminJourneys,
      GetAdminJourneysVariables
    > = {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          status: [JourneyStatus.draft, JourneyStatus.published],
          useLastActiveTeamId: true
        }
      },
      result: {
        data: {
          journeys: [
            {
              id: 'journeyId',
              title: 'Journey Title',
              status: JourneyStatus.draft,
              __typename: 'Journey',
              userJourneys: [
                {
                  id: 'userJourneyId',
                  role: UserJourneyRole.owner,
                  user: {
                    id: 'userId',
                    openedAt: null
                  }
                }
              ]
            } as unknown as Journey
          ]
        }
      }
    }

    it('should set tooltip to new journey', async () => {
      render(
        <MockedProvider
          mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
        >
          <Suspense>
            <NavigationDrawer user={user} />
          </Suspense>
        </MockedProvider>
      )
      fireEvent.mouseOver(screen.getByTestId('NavigationListItemProjects'))
      await waitFor(() =>
        expect(
          screen.getByRole('tooltip', { name: 'New Journey' })
        ).toBeInTheDocument()
      )
    })

    it('should hide user if anonymous', async () => {
      const anonymousUser = {
        ...user,
        isAnonymous: true
      } as unknown as User
      render(
        <MockedProvider
          mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
        >
          <Suspense>
            <NavigationDrawer user={anonymousUser} />
          </Suspense>
        </MockedProvider>
      )

      fireEvent.mouseOver(screen.getByTestId('NavigationListItemProjects'))
      await waitFor(() =>
        expect(
          screen.queryByTestId('NavigationListItemProfile')
        ).not.toBeInTheDocument()
      )
    })
  })
})
