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

  it('scales the dark backdrop to 80% so the card shows above (not full-screen)', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]') as HTMLElement
    expect(backdrop).toHaveStyle({ height: '80%' })
  })

  it("delineates the dark backdrop's top edge with rounded corners and a hairline border (NES-1738 Option A feedback)", () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]') as HTMLElement
    expect(backdrop).toHaveStyle({
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      // OVERLAY_INPUT_BORDER — the same hairline the overlay input pill uses.
      borderTop: '1px solid rgba(255, 255, 255, 0.12)'
    })
  })

  it('anchors the close button onto the chat surface, not the viewport top (NES-1738 Option A feedback)', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const closeButton = screen.getByRole('button', { name: 'Close chat' })
    // The dark surface starts 20% down the screen; the button sits just inside
    // its rounded top-right corner — no longer at the viewport's safe-area top.
    expect(closeButton).toHaveStyle({
      top: 'calc(20% + 12px)',
      right: '12px'
    })
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
