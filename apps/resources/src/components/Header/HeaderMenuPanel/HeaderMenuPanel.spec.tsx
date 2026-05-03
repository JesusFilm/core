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

  it('should render Watch as a top-level link without expanding Resources', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    const watchLink = screen.getByRole('link', { name: 'Watch' })
    expect(watchLink).toBeInTheDocument()
    expect(watchLink).toHaveAttribute('href', '/watch')
    expect(
      screen.queryByRole('link', { name: 'Strategies' })
    ).not.toBeInTheDocument()
  })

  it('should not render Watch inside the Resources subgroup when expanded', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    const resourcesAccordion = screen.getByRole('button', { name: 'Resources' })
    fireEvent.click(resourcesAccordion)

    expect(resourcesAccordion).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Strategies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Metaverse' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Watch' })).toHaveLength(1)
  })

  it('should place Watch between Resources and Careers in the side nav', () => {
    render(<HeaderMenuPanel onClose={mockOnClose} />)

    const resourcesAccordion = screen.getByRole('button', { name: 'Resources' })
    const watchLink = screen.getByRole('link', { name: 'Watch' })
    const careersLink = screen.getByRole('link', { name: 'Careers' })

    expect(
      resourcesAccordion.compareDocumentPosition(watchLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      watchLink.compareDocumentPosition(careersLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
