import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AuthUser } from 'next-firebase-auth'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { Role } from '../../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../JourneyView/JourneyView'
import { GET_ME } from './NavigationDrawer'
import { NavigationDrawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('NavigationDrawer', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const onClose = jest.fn()
  const signOut = jest.fn()

  it('should render the default menu items', () => {
    const { getByText, getAllByRole, getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <NavigationDrawer open onClose={onClose} title="Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getAllByRole('button')[0]).toContainElement(
      getByTestId('ChevronLeftRoundedIcon')
    )
    expect(getByText('Discover')).toBeInTheDocument()
  })

  it('should render all the menu items', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ templates: true, reports: true }}>
          <NavigationDrawer open onClose={onClose} title="Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Templates')).toBeInTheDocument()
    expect(getByText('Reports')).toBeInTheDocument()
  })

  it('should select templates button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ templates: true }}>
          <NavigationDrawer open onClose={onClose} title="Journey Templates" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('ShopRoundedIcon')).toHaveStyle(` color: '#fff'`)
  })

  it('should select the reports button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: true }}>
          <NavigationDrawer open onClose={onClose} title="Reports" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('LeaderboardRoundedIcon')).toHaveStyle(` color: '#fff'`)
  })

  it('should select publisher button', async () => {
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
        <FlagsProvider flags={{ templates: true }}>
          <NavigationDrawer
            open
            onClose={onClose}
            title="Templates Admin"
            authUser={
              {
                displayName: 'Amin One',
                photoURL: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                signOut
              } as unknown as AuthUser
            }
          />
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('ShopTwoRoundedIcon')).toHaveStyle(` color: '#fff'`)
    )
  })

  it('should have avatar menu', async () => {
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
        <FlagsProvider flags={{ templates: true }}>
          <NavigationDrawer
            open
            onClose={onClose}
            title="Templates Admin"
            authUser={
              {
                displayName: 'Amin One',
                photoURL: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                signOut
              } as unknown as AuthUser
            }
          />
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('ShopTwoRoundedIcon')).toHaveStyle(` color: '#fff'`)
    )
  })

  it('should close the navigation drawer on chevron left click', () => {
    const { getAllByRole, getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <NavigationDrawer open onClose={onClose} title="Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    const button = getAllByRole('button')[0]
    expect(button).toContainElement(getByTestId('ChevronLeftRoundedIcon'))
    fireEvent.click(button)
    expect(onClose).toHaveBeenCalled()
  })

  it('should select the journeys drawer', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <NavigationDrawer open onClose={onClose} title="Active Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('ViewCarouselRoundedIcon').parentElement).toHaveStyle(
      'color: #FFFFFF'
    )
  })
})
