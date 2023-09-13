import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User } from 'next-firebase-auth'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { Role } from '../../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../../libs/useUserRoleQuery/useUserRoleQuery'
import { GET_ME } from '../../NewPageWrapper/NavigationDrawer'

import { NavigationDrawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('NavigationDrawer', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const onClose = jest.fn()
  const signOut = jest.fn()

  it('should render the default menu items', () => {
    const { getByText, getAllByRole, getByTestId } = render(
      <MockedProvider>
        <NavigationDrawer open onClose={onClose} />
      </MockedProvider>
    )
    expect(getAllByRole('button')[0]).toContainElement(
      getByTestId('ChevronLeftRoundedIcon')
    )
    expect(getByText('Discover')).toBeInTheDocument()
  })

  it('should render all the menu items', async () => {
    const { getByText } = render(
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
          },
          {
            request: {
              query: GET_USER_ROLE
            },
            result: {
              data: {
                getUserRole: {
                  id: 'userId',
                  roles: [Role.publisher]
                }
              }
            }
          }
        ]}
      >
        <FlagsProvider flags={{ globalReports: true }}>
          <NavigationDrawer
            open
            onClose={onClose}
            user={
              {
                displayName: 'Amin One',
                photoURL: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                signOut
              } as unknown as User
            }
          />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Templates')).toBeInTheDocument()
    expect(getByText('Reports')).toBeInTheDocument()
    await waitFor(() => expect(getByText('Publisher')).toBeInTheDocument())
  })

  it('should select templates button', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/templates'
    } as unknown as NextRouter)

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationDrawer open onClose={onClose} />
      </MockedProvider>
    )
    expect(getByTestId('Templates-list-item')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should select the reports button', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/reports'
    } as unknown as NextRouter)

    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ globalReports: true }}>
          <NavigationDrawer open onClose={onClose} />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('Reports-list-item')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should hide the reports button', () => {
    const { queryByText } = render(
      <MockedProvider mocks={[]}>
        <FlagsProvider flags={{ globalReports: false }}>
          <NavigationDrawer open onClose={onClose} />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(queryByText('Reports')).not.toBeInTheDocument()
  })

  it('should select publisher button', async () => {
    mockUseRouter.mockReturnValue({
      pathname: '/publisher/[journeyId]'
    } as unknown as NextRouter)

    const { getByTestId } = render(
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
          },
          {
            request: {
              query: GET_USER_ROLE
            },
            result: {
              data: {
                getUserRole: {
                  id: 'userId',
                  roles: [Role.publisher]
                }
              }
            }
          }
        ]}
      >
        <NavigationDrawer
          open
          onClose={onClose}
          user={
            {
              displayName: 'Amin One',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut
            } as unknown as User
          }
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('Publisher-list-item')).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should show profile menu onClick', async () => {
    const { getByTestId, getByRole, getByText } = render(
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
          },
          {
            request: {
              query: GET_USER_ROLE
            },
            result: {
              data: {
                getUserRole: {
                  id: 'userId',
                  roles: [Role.publisher]
                }
              }
            }
          }
        ]}
      >
        <NavigationDrawer
          open
          onClose={onClose}
          user={
            {
              displayName: 'Amin One',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut
            } as unknown as User
          }
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('img', { name: 'Amin One' })).toBeInTheDocument()
    )
    expect(getByTestId('Profile-list-item')).toHaveAttribute(
      'aria-selected',
      'false'
    )
    fireEvent.click(getByRole('img', { name: 'Amin One' }))
    await waitFor(() => expect(getByText('Amin One')).toBeInTheDocument())
    fireEvent.click(getByRole('menuitem', { name: 'Logout' }))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })

  it('should close the navigation drawer on chevron left click', () => {
    const { getAllByRole, getByTestId } = render(
      <MockedProvider>
        <NavigationDrawer open onClose={onClose} />
      </MockedProvider>
    )
    const button = getAllByRole('button')[0]
    expect(button).toContainElement(getByTestId('ChevronLeftRoundedIcon'))
    fireEvent.click(button)
    expect(onClose).toHaveBeenCalled()
  })

  it('should select the journeys drawer', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/'
    } as unknown as NextRouter)

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationDrawer open onClose={onClose} />
      </MockedProvider>
    )
    expect(getByTestId('ViewCarouselRoundedIcon').parentElement).toHaveStyle(
      'color: #FFFFFF'
    )
  })
})
