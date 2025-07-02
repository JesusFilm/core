import { FetchResult } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../../__generated__/GetAdminJourneys'
import { GetMe } from '../../../../../__generated__/GetMe'
import { GetUserRole } from '../../../../../__generated__/GetUserRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'

import { GET_ME } from './UserNavigation'

import { UserNavigation } from '.'

describe('UserNavigation', () => {
  const user = {
    id: 'userId',
    displayName: 'Amin One',
    photoURL: 'https://bit.ly/3Gth4Yf',
    email: 'amin@email.com'
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
        journeys: []
      }
    }
  }

  it('should show publisher button when publisher', async () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
      >
        <Suspense>
          <UserNavigation user={user} selectedPage="publisher" />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('NavigationListItemProfile')).toBeInTheDocument()
    )
    expect(getByTestId('NavigationListItemPublisher')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemPublisher')).toHaveAttribute(
      'href',
      '/publisher'
    )
  })

  it('should hide publisher button when not publisher', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider
        mocks={[
          getMeMock,
          getAdminJourneysMock,
          {
            ...getUserRoleMock,
            result: {
              data: {
                getUserRole: {
                  id: 'userId',
                  roles: [],
                  __typename: 'UserRole'
                }
              }
            }
          }
        ]}
      >
        <Suspense>
          <UserNavigation user={user} selectedPage="publisher" />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('NavigationListItemProfile')).toBeInTheDocument()
    )
    expect(queryByTestId('NavigationListItemPublisher')).not.toBeInTheDocument()
  })

  it('should show impersonate button when super admin', async () => {
    const { getByTestId, getByRole, queryByTestId } = render(
      <MockedProvider
        mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
      >
        <SnackbarProvider>
          <Suspense>
            <UserNavigation user={user} selectedPage="publisher" />
          </Suspense>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('NavigationListItemProfile')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('NavigationListItemImpersonate'))
    await waitFor(() =>
      expect(getByTestId('ImpersonateDialog')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByTestId('ImpersonateDialog')).not.toBeInTheDocument()
    )
  })

  it('should hide impersonate button when not super admin', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getUserRoleMock,
          {
            ...getMeMock,
            result: {
              data: {
                me: {
                  id: 'userId',
                  firstName: 'Amin',
                  lastName: 'One',
                  imageUrl: 'https://bit.ly/3Gth4Yf',
                  email: 'amin@email.com',
                  superAdmin: false,
                  __typename: 'User'
                }
              }
            }
          }
        ]}
      >
        <Suspense>
          <UserNavigation user={user} selectedPage="publisher" />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('NavigationListItemProfile')).toBeInTheDocument()
    )
    expect(
      queryByTestId('NavigationListItemImpersonate')
    ).not.toBeInTheDocument()
  })

  it('should show profile button', async () => {
    const { getByTestId, queryByTestId, getByRole } = render(
      <MockedProvider
        mocks={[getMeMock, getUserRoleMock, getAdminJourneysMock]}
      >
        <SnackbarProvider>
          <Suspense>
            <UserNavigation user={user} />
          </Suspense>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('NavigationListItemProfile')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('NavigationListItemProfile'))
    await waitFor(() => expect(getByTestId('UserMenu')).toBeInTheDocument())
    fireEvent.click(getByRole('presentation').firstElementChild as Element)
    await waitFor(() =>
      expect(queryByTestId('UserMenu')).not.toBeInTheDocument()
    )
  })

  it('should not show user icon if logged out', async () => {
    const getUserRoleMockResult = jest.fn(
      () => getUserRoleMock.result as FetchResult<GetUserRole>
    )
    const getAdminJourneysMockResult = jest.fn(
      () => getAdminJourneysMock.result as FetchResult<GetAdminJourneys>
    )
    const getMeMockResult = jest.fn(() => ({ data: { me: null } }))
    const { queryByTestId } = render(
      <MockedProvider
        mocks={[
          { ...getUserRoleMock, result: getUserRoleMockResult },
          { ...getAdminJourneysMock, result: getAdminJourneysMockResult },
          { ...getMeMock, result: getMeMockResult }
        ]}
      >
        <Suspense>
          <UserNavigation user={user} />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getUserRoleMockResult).toHaveBeenCalledTimes(1)
      expect(getAdminJourneysMockResult).toHaveBeenCalledTimes(1)
      expect(getMeMockResult).toHaveBeenCalledTimes(1)
    })
    expect(queryByTestId('NavigationListItemProfile')).not.toBeInTheDocument()
  })

  it('should set tooltip to new editing request', async () => {
    const setTooltip = jest.fn()
    render(
      <MockedProvider
        mocks={[
          getMeMock,
          getUserRoleMock,
          {
            ...getAdminJourneysMock,
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
                          openedAt: new Date().toISOString()
                        }
                      },
                      {
                        id: 'userJourneyId1',
                        role: UserJourneyRole.inviteRequested,
                        user: {
                          id: 'userId1',
                          openedAt: new Date().toISOString()
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <Suspense>
          <UserNavigation user={user} setTooltip={setTooltip} />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(setTooltip).toHaveBeenCalledWith('New Editing Request')
    )
  })

  it('should set tooltip to new journey', async () => {
    const setTooltip = jest.fn()
    render(
      <MockedProvider
        mocks={[
          getMeMock,
          getUserRoleMock,
          {
            ...getAdminJourneysMock,
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
                  }
                ]
              }
            }
          }
        ]}
      >
        <Suspense>
          <UserNavigation user={user} setTooltip={setTooltip} />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() => expect(setTooltip).toHaveBeenCalledWith('New Journey'))
  })
})
