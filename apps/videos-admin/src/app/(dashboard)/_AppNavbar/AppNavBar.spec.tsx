import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GET_NAVIGATION_ROLES } from '../../../components/MenuContent/MenuContent'

import { AppNavbar } from './AppNavbar'

const mediaPublisherMock = {
  request: { query: GET_NAVIGATION_ROLES },
  result: {
    data: {
      me: {
        id: 'userId',
        __typename: 'AuthenticatedUser',
        mediaUserRoles: ['publisher'],
        languageUserRoles: []
      }
    }
  }
}

vi.mock('next/navigation')

describe('AppNavBar', () => {
  it('should show theme toggle and menu button and logo', async () => {
    render(
      <MockedProvider mocks={[]}>
        <AppNavbar />
      </MockedProvider>
    )
    expect(screen.getByRole('img')).toBeInTheDocument()

    expect(screen.getByTestId('ToggleColorModeDark')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument()
    expect(screen.queryByTestId('PermissionLevel')).not.toBeInTheDocument()
  })

  it('should show menu drawer on menu button click', async () => {
    render(
      <MockedProvider mocks={[mediaPublisherMock]}>
        <AppNavbar />
      </MockedProvider>
    )

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'menu' }))
    )
    await waitFor(() =>
      expect(screen.getByTestId('SideMenuMobile')).toBeInTheDocument()
    )
  })
})
