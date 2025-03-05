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
})
