import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { type MockedFunction } from 'vitest'

import { NavbarBreadcrumbs } from './Breadcrumbs'

vi.mock('next/navigation', async () => ({
  ...(await vi.importActual('next/navigation')),
  usePathname: vi.fn()
}))

const mockedUsePathname = usePathname as MockedFunction<typeof usePathname>

describe('NavbarBreadcrumbs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should show home breadcrumb', async () => {
    mockedUsePathname.mockReturnValue('/')
    render(<NavbarBreadcrumbs />)

    expect(screen.getByTestId('HomeRoundedIcon')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should show icon and values for existing breadcrumbs', async () => {
    mockedUsePathname.mockReturnValue('/videos')
    render(<NavbarBreadcrumbs />)

    expect(screen.getByTestId('VideoLibraryRoundedIcon')).toBeInTheDocument()
    expect(screen.getByText('Video Library')).toBeInTheDocument()
  })

  it('should show the status pipeline breadcrumb label', async () => {
    mockedUsePathname.mockReturnValue('/videos/status-pipeline')
    render(<NavbarBreadcrumbs />)

    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(screen.getByText('Status Pipeline')).toBeInTheDocument()
  })

  it('should show the algolia debugging breadcrumb label', async () => {
    mockedUsePathname.mockReturnValue('/videos/algolia-debugging')
    render(<NavbarBreadcrumbs />)

    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(screen.getByText('Algolia Debugging')).toBeInTheDocument()
  })

  it('should handle routes that are not predefined', async () => {
    mockedUsePathname.mockReturnValue('/random')
    render(<NavbarBreadcrumbs />)

    expect(screen.getByText('Random')).toBeInTheDocument()
  })
})
