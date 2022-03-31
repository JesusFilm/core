import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { AuthUser } from 'next-firebase-auth'
import { GET_ME } from './NavigationDrawer'
import { NavigationDrawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('NavigationDrawer', () => {
  const onClose = jest.fn()
  const signOut = jest.fn()

  it('should render the drawer', () => {
    const { getByText, getAllByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ME
            },
            result: {
              data: {
                me: {
                  id: 'userId',
                  firstName: 'Amin',
                  lastName: 'One',
                  imageUrl: 'https://but.ly/3Gth4Yf',
                  email: 'amin@email.com'
                }
              }
            }
          }
        ]}
      >
        <NavigationDrawer
          open={true}
          onClose={onClose}
          AuthUser={
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

    expect(getAllByRole('button')[0]).toContainElement(
      getByTestId('ChevronLeftRoundedIcon')
    )
    expect(getByText('Discover')).toBeInTheDocument()
  })

  it('should have avatar menu', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
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
                  email: 'amin@email.com'
                }
              }
            }
          }
        ]}
      >
        <NavigationDrawer
          open={true}
          onClose={onClose}
          AuthUser={
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
    await waitFor(() =>
      expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('img', { name: 'Amin One' }))
    await waitFor(() => expect(getByText('Amin One')).toBeInTheDocument())
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })

  it('should open and close the nav drawer on click', () => {
    const { getAllByRole, getByTestId, getByText } = render(
      <MockedProvider
        mocks={[
          {
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
                  email: 'amin@email.com'
                }
              }
            }
          }
        ]}
      >
        <NavigationDrawer
          open={true}
          onClose={onClose}
          AuthUser={
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
    const button = getAllByRole('button')[0]
    expect(button).toContainElement(getByTestId('ChevronLeftRoundedIcon'))
    fireEvent.click(button)
    expect(getByText('Discover')).toBeInTheDocument()
    fireEvent.click(button)
    expect(button).toContainElement(getByTestId('ChevronLeftRoundedIcon'))
  })
})
