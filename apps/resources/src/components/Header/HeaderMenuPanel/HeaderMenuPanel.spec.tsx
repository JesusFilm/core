import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { HeaderMenuPanel } from './HeaderMenuPanel'

describe('HeaderMenuPanel', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render panel', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    expect(screen.getByRole('link', { name: 'Give Now' })).toBeInTheDocument()
  })

  it('should handle accordion expand and collapse', async () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    const accordion = screen.getByRole('button', { name: 'Give' })
    expect(
      screen.queryByRole('link', { name: 'Ways to Give' })
    ).not.toBeInTheDocument()
    expect(accordion).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(accordion)
    expect(accordion).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('link', { name: 'Ways to Give' })
    ).toBeInTheDocument()

    fireEvent.click(accordion)
    expect(accordion).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Ways to Give' })
      ).not.toBeInTheDocument()
    )
  })
})
