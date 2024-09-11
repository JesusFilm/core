import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { AuthProvider } from '../../libs/auth/AuthProvider'

import { SideMenuMobile } from './SideMenuMobile'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn()
}))

describe('SideMenuMobile', () => {
  it('should show menu content', () => {
    const handleToggle = jest.fn()

    render(
      <AuthProvider
        user={{
          id: '1',
          name: 'Nameingham',
          email: 'nameingham@example.com',
          photoURL: 'url-of-nameinghams-photo'
        }}
      >
        <NextIntlClientProvider locale="en">
          <SideMenuMobile toggleDrawer={handleToggle} open />
        </NextIntlClientProvider>
      </AuthProvider>
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should show user avatar and display name', () => {
    const handleToggle = jest.fn()
    render(
      <AuthProvider
        user={{
          id: '1',
          displayName: 'Nameingham',
          email: 'nameingham@example.com',
          photoURL: 'url-of-nameinghams-photo'
        }}
      >
        <NextIntlClientProvider locale="en">
          <SideMenuMobile toggleDrawer={handleToggle} open />
        </NextIntlClientProvider>
      </AuthProvider>
    )

    expect(screen.getByText('Nameingham')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nameingham' })).toBeInTheDocument()
  })
})
