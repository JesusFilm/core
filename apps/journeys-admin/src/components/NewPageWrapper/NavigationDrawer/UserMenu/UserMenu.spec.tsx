import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { AuthUser } from 'next-firebase-auth'

import { UserMenu } from './UserMenu'

describe('UserMenu', () => {
  const handleProfileClose = jest.fn()
  const signOut = jest.fn()

  it('should render the menu', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <UserMenu
          user={{
            __typename: 'User',
            id: 'userId',
            firstName: 'Amin',
            lastName: 'One',
            imageUrl: 'https://bit.ly/3Gth4Yf',
            email: 'amin@email.com'
          }}
          profileOpen
          profileAnchorEl={null}
          handleProfileClose={handleProfileClose}
          authUser={
            {
              displayName: 'Amin One',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut
            } as unknown as AuthUser
          }
        />
      </MockedProvider>
    )
    expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    expect(getByText('amin@email.com')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument()
  })

  it('should call signOut on logout click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <UserMenu
          user={{
            __typename: 'User',
            id: 'userId',
            firstName: 'Amin',
            lastName: 'One',
            imageUrl: 'https://bit.ly/3Gth4Yf',
            email: 'amin@email.com'
          }}
          profileOpen
          profileAnchorEl={null}
          handleProfileClose={handleProfileClose}
          authUser={
            {
              displayName: 'Amin One',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut
            } as unknown as AuthUser
          }
        />
      </MockedProvider>
    )
    expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    expect(signOut).toHaveBeenCalled()
  })
})
