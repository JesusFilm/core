import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AuthUser } from 'next-firebase-auth'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
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

  it('should render the drawer', () => {
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

  it('should show reports button', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: true }}>
          <NavigationDrawer open onClose={onClose} title="Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Reports')).toBeInTheDocument()
  })

  it('should hide reports button', () => {
    const { queryByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: false }}>
          <NavigationDrawer open onClose={onClose} title="Journeys" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(queryByText('Reports')).not.toBeInTheDocument()
  })

  it('should select the reports button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider flags={{ reports: true }}>
          <NavigationDrawer open onClose={onClose} title="Reports" />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('AssessmentRoundedIcon')).toHaveStyle(` color: '#fff'`)
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
        <FlagsProvider>
          <NavigationDrawer
            open
            onClose={onClose}
            authUser={
              {
                displayName: 'Amin One',
                photoURL: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com',
                signOut
              } as unknown as AuthUser
            }
            title="Journeys"
          />
        </FlagsProvider>
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
    expect(getByTestId('ExploreRoundedIcon').parentElement).toHaveStyle(
      'color: #FFFFFF'
    )
  })
})
