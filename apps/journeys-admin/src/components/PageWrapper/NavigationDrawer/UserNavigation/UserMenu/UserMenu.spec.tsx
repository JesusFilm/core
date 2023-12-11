import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

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
    expect(getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument()
  })

  it('should call signOut on logout click', async () => {
    const { getByRole, getByText } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
    await waitFor(() =>
      expect(getByText('Logout successful')).toBeInTheDocument()
    )
  })
})
