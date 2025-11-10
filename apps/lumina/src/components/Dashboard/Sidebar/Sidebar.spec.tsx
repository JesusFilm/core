import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { Sidebar } from './Sidebar'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

describe('Sidebar', () => {
  beforeEach(() => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
  })

  it('renders the logo and brand name', () => {
    render(<Sidebar />)
    expect(screen.getByText('Lumina AI')).toBeInTheDocument()
  })

  it('renders all menu items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByText('Websites')).toBeInTheDocument()
    expect(screen.getByText('Widgets')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active menu item', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/agents')
    render(<Sidebar />)
    const agentsLink = screen.getByText('Agents').closest('a')
    expect(agentsLink).toHaveClass('bg-primary-50', 'text-primary-600')
  })

  it('calls onNavigate when a menu item is clicked', () => {
    const onNavigate = jest.fn()
    render(<Sidebar onNavigate={onNavigate} />)
    const agentsLink = screen.getByText('Agents').closest('a')
    agentsLink?.click()
    expect(onNavigate).toHaveBeenCalled()
  })
})

