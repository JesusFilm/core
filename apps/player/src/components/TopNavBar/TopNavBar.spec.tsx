import { render, screen } from '@testing-library/react'

import { TopNavBar } from '.'

describe('TopNavBar', () => {
  it('renders navigation bar', () => {
    const { container } = render(<TopNavBar />)

    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('sticky', 'top-0', 'z-50')
  })

  it('renders logo image', () => {
    render(<TopNavBar />)

    const logo = screen.getByAltText('Jesus Film Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('width', '126')
    expect(logo).toHaveAttribute('height', '40')
  })

  it('renders ThemeToggle component', () => {
    render(<TopNavBar />)

    const themeToggle = screen.getByRole('button')
    expect(themeToggle).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    const { container } = render(<TopNavBar />)

    const nav = container.querySelector('nav')
    const flexContainer = nav?.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
    expect(flexContainer).toHaveClass('h-20', 'items-center', 'justify-between')
  })

  it('applies dark mode classes', () => {
    const { container } = render(<TopNavBar />)

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('dark:bg-background-dark', 'bg-white')
  })
})
