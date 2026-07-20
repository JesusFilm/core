import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { GET_NAVIGATION_ROLES } from '../../../../components/MenuContent/MenuContent'
import { AuthProvider } from '../../../../libs/auth/AuthProvider'

import { SideMenuMobile } from './SideMenuMobile'

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

vi.mock('next/navigation', async () => ({
  ...(await vi.importActual('next/navigation')),
  useRouter: vi.fn()
}))

describe('SideMenuMobile', () => {
  it('should show menu content', async () => {
    const handleToggle = vi.fn()

    render(
      <MockedProvider mocks={[mediaPublisherMock]}>
        <AuthProvider
          user={{
            id: '1',
            name: 'Nameingham',
            email: 'nameingham@example.com',
            photoURL: 'url-of-nameinghams-photo'
          }}
        >
          <SideMenuMobile toggleDrawer={handleToggle} open />
        </AuthProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should show user avatar and display name', () => {
    const handleToggle = vi.fn()
    render(
      <MockedProvider mocks={[mediaPublisherMock]}>
        <AuthProvider
          user={{
            id: '1',
            displayName: 'Nameingham',
            email: 'nameingham@example.com',
            photoURL: 'url-of-nameinghams-photo'
          }}
        >
          <SideMenuMobile toggleDrawer={handleToggle} open />
        </AuthProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Nameingham')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nameingham' })).toBeInTheDocument()
  })
})
