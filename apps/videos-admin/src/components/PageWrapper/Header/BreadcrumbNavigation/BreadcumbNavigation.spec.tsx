import { render, screen } from '@testing-library/react'
import { BreadcrumbNavigation } from './BreadcrumbNavigation'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn()
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('BreadcrumbNavigation', () => {
  it('should have proper link for breadcrumb', () => {
    mockUsePathname.mockReturnValue('/en/route/anotherroute')

    render(<BreadcrumbNavigation />)

    const crumbs = screen.getAllByRole('link')
    expect(crumbs).toHaveLength(3)
    expect(crumbs[0]).toHaveProperty('href', 'http://localhost/en')
    expect(crumbs[0]).toHaveTextContent('Dashboard')
    expect(crumbs[1]).toHaveProperty('href', 'http://localhost/en/route')
    expect(crumbs[1]).toHaveTextContent('Route')
    expect(crumbs[2]).toHaveProperty(
      'href',
      'http://localhost/en/route/anotherroute'
    )
    expect(crumbs[2]).toHaveTextContent('Anotherroute')
  })
})
