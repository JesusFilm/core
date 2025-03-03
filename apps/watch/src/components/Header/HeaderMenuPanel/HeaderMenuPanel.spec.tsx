import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { HeaderMenuPanel } from './HeaderMenuPanel'

describe('HeaderMenuPanel', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render panel', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    expect(
      screen.getByRole('button', { name: 'close drawer' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Give Now' })).toBeInTheDocument()
  })

  it('should close panel when close button is clicked', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'close drawer' }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should handle accordion expand and collapse', async () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    const accordion = screen.getByRole('button', { name: 'About Us' })
    expect(
      screen.queryByRole('link', { name: 'Our Organization' })
    ).not.toBeInTheDocument()
    expect(accordion).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(accordion)
    expect(accordion).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('link', { name: 'Our Organization' })
    ).toBeInTheDocument()

    fireEvent.click(accordion)
    expect(accordion).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Our Organization' })
      ).not.toBeInTheDocument()
    )
  })
})
