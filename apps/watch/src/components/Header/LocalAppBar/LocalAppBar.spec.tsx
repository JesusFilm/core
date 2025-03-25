import { fireEvent, render, screen } from '@testing-library/react'

import { LocalAppBar } from './LocalAppBar'

describe('LocalAppBar', () => {
  const mockOnMenuClick = jest.fn()

  beforeEach(() => {
    mockOnMenuClick.mockReset()
  })

  it('should render correctly', () => {
    render(<LocalAppBar onMenuClick={mockOnMenuClick} />)

    expect(screen.getByTestId('Header')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Watch Logo' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'open header menu' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('MenuBox')).toBeInTheDocument()
  })

  it('should call onMenuClick when menu button is clicked', () => {
    render(<LocalAppBar onMenuClick={mockOnMenuClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'open header menu' }))
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
  })

  it('should have a link to the watch page', () => {
    render(<LocalAppBar onMenuClick={mockOnMenuClick} />)

    expect(screen.getByTestId('WatchLogo')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/'
    )
  })

  it('should add expanded class to menu button when menuOpen is true', () => {
    render(<LocalAppBar onMenuClick={mockOnMenuClick} menuOpen />)

    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should not add expanded class to menu button when menuOpen is false', () => {
    render(<LocalAppBar onMenuClick={mockOnMenuClick} menuOpen={false} />)

    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).not.toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
