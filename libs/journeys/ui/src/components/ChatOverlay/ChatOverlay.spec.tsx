import { fireEvent, render, screen } from '@testing-library/react'

import { ChatOverlay } from './ChatOverlay'

// AiChat is loaded via next/dynamic and pulls in heavy streaming/markdown
// machinery jsdom lacks; the overlay layout under test doesn't depend on its
// internals, so stub it to a lightweight marker.
vi.mock('../AiChat', () => ({
  __esModule: true,
  AiChat: ({ variant }: { variant?: string }) => (
    <div data-testid="AiChatMock" data-variant={variant} />
  )
}))

describe('ChatOverlay', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<ChatOverlay open={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the overlay when open', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    expect(screen.getByTestId('ChatOverlay')).toBeInTheDocument()
    expect(screen.getByTestId('AiChatMock')).toHaveAttribute(
      'data-variant',
      'overlay'
    )
  })

  it('renders the inner panel at 80% height (Option A — reveals the card behind)', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    // The panel is the AiChat mock's parent Box.
    const panel = screen.getByTestId('AiChatMock').parentElement as HTMLElement
    expect(panel).toHaveStyle({ height: '80%' })
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ChatOverlay open onClose={onClose} />)
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<ChatOverlay open onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
