import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { Suspense } from 'react'

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
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { GET_USER_ROLE } from '../../../libs/useUserRoleQuery/useUserRoleQuery'

import { GET_ME } from './UserNavigation'

import { NavigationDrawer } from '.'

describe('NavigationDrawer', () => {
  it('should show toggle and call onClose with false when open', async () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(
      <NavigationDrawer open onClose={handleClose} />
    )
    fireEvent.click(getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(false)
  })

  it('should show toggle and call onClose with false when not open', async () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(<NavigationDrawer onClose={handleClose} />)
    fireEvent.click(getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(true)
  })

  it('should show selected discover link when selected page empty', async () => {
    const { getByTestId } = render(<NavigationDrawer open selectedPage="" />)
    expect(getByTestId('NavigationListItemDiscover')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemDiscover')).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('should show selected discover link when selected page journeys', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="journeys" />
    )
    expect(getByTestId('NavigationListItemDiscover')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemDiscover')).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('should show selected templates link when selected page templates', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open onClose={jest.fn()} selectedPage="templates" />
    )
    expect(getByTestId('NavigationListItemTemplates')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemTemplates')).toHaveAttribute(
      'href',
      '/templates'
    )
  })

  describe('UserNavigation', () => {
    const user = {
      id: 'userId',
      displayName: 'Amin One',
      photoURL: 'https://bit.ly/3Gth4Yf',
      email: 'amin@email.com'
    } as unknown as User

    const getMeMock: MockedResponse<GetMe> = {
      request: {
        query: GET_ME
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
            __typename: 'User'
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
      const { getByTestId, getByRole } = render(
        <MockedProvider
          mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
        >
          <Suspense>
            <NavigationDrawer user={user} />
          </Suspense>
        </MockedProvider>
      )
      fireEvent.focusIn(getByTestId('NavigationListItemDiscover'))
      await waitFor(() =>
        expect(
          getByRole('tooltip', { name: 'New Journey' })
        ).toBeInTheDocument()
      )
    })
  })
})
