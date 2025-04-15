import { render, screen } from '@testing-library/react'

import { AuthProvider } from '../../../libs/auth/AuthProvider'

import { SideMenu } from './SideMenu'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn()
}))

describe('SideMenu', () => {
  it('should show jfp logo', () => {
    render(
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
    )

    expect(screen.getByAltText('Jesus Film Project')).toBeInTheDocument()
  })

  it('should show menu content', () => {
    render(
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
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should have user menu', () => {
    render(
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
    )

    expect(
      screen.getByRole('button', { name: 'Open menu' })
    ).toBeInTheDocument()
  })

  it('should show user avatar and details', () => {
    render(
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
    )

    expect(screen.getByText('Nameingham')).toBeInTheDocument()
    expect(screen.getByText('nameingham@example.com')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nameingham' })).toBeInTheDocument()
  })
})
