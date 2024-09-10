import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { NavbarBreadcrumbs } from './NavbarBreadcrumbs'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn()
}))

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('NavbarBreadcrumbs', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should show home breadcrumb', async () => {
    mockedUsePathname.mockReturnValue('/en/videos')
    render(
      <NextIntlClientProvider locale="en">
        <NavbarBreadcrumbs />
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('HomeRoundedIcon')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should show icon and values for existing breadcrumbs', async () => {
    mockedUsePathname.mockReturnValue('/en/videos')
    render(
      <NextIntlClientProvider locale="en">
        <NavbarBreadcrumbs />
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('VideoLibraryRoundedIcon')).toBeInTheDocument()
    expect(screen.getByText('Video Library')).toBeInTheDocument()
  })

  it('should handle routes that are not predefined', async () => {
    mockedUsePathname.mockReturnValue('/en/random')
    render(
      <NextIntlClientProvider locale="en">
        <NavbarBreadcrumbs />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Random')).toBeInTheDocument()
  })
})
