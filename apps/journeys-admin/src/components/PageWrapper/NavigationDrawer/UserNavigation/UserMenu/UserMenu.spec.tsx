import { ApolloClient, useApolloClient } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { UserMenu } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@apollo/client', () => ({
  __esModule: true,
  ...jest.requireActual('@apollo/client'),
  useApolloClient: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseApolloClient = useApolloClient as jest.MockedFunction<
  typeof useApolloClient
>

describe('UserMenu', () => {
  const handleProfileClose = jest.fn()
  const signOut = jest.fn()

  const mockWindowLocationAssign = (href: string) => {
    const mockAssign = jest.fn()
    Object.defineProperty(window, 'location', {
      value: {
        assign: mockAssign,
        href
      },
      writable: true
    })
    return mockAssign
  }

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

  it('should call signOut and clearStore on logout click', async () => {
    const clearStore = jest.fn()
    mockUseApolloClient.mockReturnValue({
      clearStore
    } as unknown as ApolloClient<object>)

    const mockAssign = mockWindowLocationAssign(
      'http://localhost:4200/journeys'
    )

    mockUseRouter.mockReturnValue({
      pathname: '/journeys'
    } as unknown as NextRouter)

    const { getByRole } = render(
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

    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
    expect(clearStore).toHaveBeenCalled()
    expect(mockAssign).toHaveBeenCalledWith(
      '/users/sign-in?redirect=' +
        encodeURIComponent('http://localhost:4200/journeys')
    )
  })

  it('should not redirect when logging out from templates page', async () => {
    const clearStore = jest.fn()
    mockUseApolloClient.mockReturnValue({
      clearStore
    } as unknown as ApolloClient<object>)

    const mockAssign = mockWindowLocationAssign(
      'http://localhost:4200/templates/123'
    )

    mockUseRouter.mockReturnValue({
      pathname: '/templates/123'
    } as unknown as NextRouter)

    const { getByRole } = render(
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

    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
    expect(clearStore).toHaveBeenCalled()
    expect(mockAssign).not.toHaveBeenCalled()
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
