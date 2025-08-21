import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../../__generated__/globalTypes'

import { UserNavigation } from '.'

// Mock dynamic UserMenu/ImpersonateDialog to avoid loadable act noise
jest.mock('./UserMenu', () => ({
  __esModule: true,
  UserMenu: ({
    profileOpen,
    handleProfileClose
  }: {
    profileOpen?: boolean
    handleProfileClose?: () => void
  }) =>
    profileOpen ? (
      <div role="presentation" onClick={handleProfileClose}>
        <div data-testid="UserMenu" />
      </div>
    ) : null
}))
jest.mock('./ImpersonateDialog', () => ({
  __esModule: true,
  ImpersonateDialog: ({
    open,
    onClose
  }: {
    open: boolean
    onClose?: () => void
  }) =>
    open ? (
      <div data-testid="ImpersonateDialog">
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}))

// Synchronous Apollo + local suspense hooks for tests
const mockUseSuspenseQuery = jest.fn()
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useSuspenseQuery: (...args: unknown[]) => mockUseSuspenseQuery(...args)
  }
})

const mockUseUserRoleSuspenseQuery = jest.fn()
jest.mock('../../../../libs/useUserRoleSuspenseQuery', () => ({
  __esModule: true,
  useUserRoleSuspenseQuery: (...args: unknown[]) =>
    mockUseUserRoleSuspenseQuery(...args)
}))

const mockUseAdminJourneysSuspenseQuery = jest.fn()
jest.mock('../../../../libs/useAdminJourneysSuspenseQuery', () => ({
  __esModule: true,
  useAdminJourneysSuspenseQuery: (...args: unknown[]) =>
    mockUseAdminJourneysSuspenseQuery(...args)
}))
describe('UserNavigation', () => {
  const user = {
    id: 'userId',
    displayName: 'Amin One',
    photoURL: 'https://bit.ly/3Gth4Yf',
    email: 'amin@email.com'
  } as unknown as User

  beforeEach(() => {
    mockUseSuspenseQuery.mockReset()
    mockUseUserRoleSuspenseQuery.mockReset()
    mockUseAdminJourneysSuspenseQuery.mockReset()

    mockUseSuspenseQuery.mockReturnValue({
      data: {
        me: {
          id: 'userId',
          firstName: 'Amin',
          lastName: 'One',
          imageUrl: 'https://bit.ly/3Gth4Yf',
          email: 'amin@email.com',
          superAdmin: true
        }
      }
    })
    mockUseUserRoleSuspenseQuery.mockReturnValue({
      data: { getUserRole: { id: 'userId', roles: [Role.publisher] } }
    })
    mockUseAdminJourneysSuspenseQuery.mockReturnValue({
      data: { journeys: [] }
    })
  })

  it('should show publisher button when publisher', async () => {
    const { getByTestId } = render(
      <MockedProvider>
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
    mockUseUserRoleSuspenseQuery.mockReturnValueOnce({
      data: { getUserRole: { id: 'userId', roles: [] } }
    })
    const { getByTestId, queryByTestId } = render(
      <MockedProvider>
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
      <MockedProvider>
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
    mockUseSuspenseQuery.mockReturnValueOnce({
      data: {
        me: {
          id: 'userId',
          firstName: 'Amin',
          lastName: 'One',
          imageUrl: 'https://bit.ly/3Gth4Yf',
          email: 'amin@email.com',
          superAdmin: false
        }
      }
    })
    const { getByTestId, queryByTestId } = render(
      <MockedProvider>
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
      <MockedProvider>
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
    mockUseSuspenseQuery.mockReturnValueOnce({ data: { me: null } })
    const { queryByTestId } = render(
      <MockedProvider>
        <Suspense>
          <UserNavigation user={user} />
        </Suspense>
      </MockedProvider>
    )
    expect(queryByTestId('NavigationListItemProfile')).not.toBeInTheDocument()
  })

  it('should set tooltip to new editing request', async () => {
    const setTooltip = jest.fn()
    mockUseAdminJourneysSuspenseQuery.mockReturnValueOnce({
      data: {
        journeys: [
          {
            id: 'journeyId',
            title: 'Journey Title',
            status: JourneyStatus.draft,
            userJourneys: [
              {
                id: 'userJourneyId',
                role: UserJourneyRole.owner,
                user: { id: 'userId', openedAt: new Date().toISOString() }
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
    })
    render(
      <MockedProvider>
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
    mockUseAdminJourneysSuspenseQuery.mockReturnValueOnce({
      data: {
        journeys: [
          {
            id: 'journeyId',
            title: 'Journey Title',
            status: JourneyStatus.draft,
            userJourneys: [
              {
                id: 'userJourneyId',
                role: UserJourneyRole.owner,
                user: { id: 'userId', openedAt: null }
              }
            ]
          }
        ]
      }
    })
    render(
      <MockedProvider>
        <Suspense>
          <UserNavigation user={user} setTooltip={setTooltip} />
        </Suspense>
      </MockedProvider>
    )
    await waitFor(() => expect(setTooltip).toHaveBeenCalledWith('New Journey'))
  })
})
