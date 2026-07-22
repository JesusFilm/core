import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { GET_NAVIGATION_ROLES } from '../../../components/MenuContent/MenuContent'
import { AuthProvider } from '../../../libs/auth/AuthProvider'

import { SideMenu } from './SideMenu'

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

describe('SideMenu', () => {
  it('should show jfp logo', () => {
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
          <SideMenu />
        </AuthProvider>
      </MockedProvider>
    )

    expect(screen.getByAltText('Jesus Film Project')).toBeInTheDocument()
  })

  it('should show menu content', async () => {
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
          <SideMenu />
        </AuthProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Video Status Pipeline' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should have user menu', () => {
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
          <SideMenu />
        </AuthProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Open menu' })
    ).toBeInTheDocument()
  })

  it('should show user avatar and details', () => {
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
          <SideMenu />
        </AuthProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Nameingham')).toBeInTheDocument()
    expect(screen.getByText('nameingham@example.com')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nameingham' })).toBeInTheDocument()
  })
})
