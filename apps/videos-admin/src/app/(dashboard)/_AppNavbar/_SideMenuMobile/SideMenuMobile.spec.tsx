import { render, screen } from '@testing-library/react'

import { AuthProvider } from '../../../../libs/auth/AuthProvider'

import { SideMenuMobile } from './SideMenuMobile'

vi.mock('next/navigation', async () => ({
  ...(await vi.importActual('next/navigation')),
  useRouter: vi.fn()
}))

describe('SideMenuMobile', () => {
  it('should show menu content', () => {
    const handleToggle = vi.fn()

    render(
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
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should show user avatar and display name', () => {
    const handleToggle = vi.fn()
    render(
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
    )

    expect(screen.getByText('Nameingham')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nameingham' })).toBeInTheDocument()
  })
})
