import { render, screen } from '@testing-library/react'
import { PageWrapper } from './PageWrapper'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn()
}))

jest.mock('next-auth')

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('PageWrapper', () => {
  it('should show breadcrumb', () => {
    mockUsePathname.mockReturnValue('/en')

    render(<PageWrapper />)

    expect(screen.getByTestId('BreadcrumbNavigation')).toBeInTheDocument()
  })

  it('should show side nav', () => {
    mockUsePathname.mockReturnValue('/en')

    render(<PageWrapper />)

    expect(screen.getByTestId('VideosAdminSideNav')).toBeInTheDocument()
  })

  it('should take children', () => {
    mockUsePathname.mockReturnValue('/en')

    render(
      <PageWrapper>
        <div data-testid="NestedChild"></div>
      </PageWrapper>
    )

    expect(screen.getByTestId('NestedChild')).toBeInTheDocument()
  })
})
