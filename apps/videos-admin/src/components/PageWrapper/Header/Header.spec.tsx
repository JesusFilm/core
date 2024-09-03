import { render, screen } from '@testing-library/react'
import { Header } from './Header'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn()
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('Header', () => {
  it('should show breadcrumb', () => {
    mockUsePathname.mockReturnValue('/en/route/anotherroute')

    render(<Header />)

    expect(screen.getByTestId('BreadcrumbNavigation')).toBeInTheDocument()
  })
})
