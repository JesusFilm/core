import { fireEvent, render, screen } from '@testing-library/react'

import { ChatOverlay } from './ChatOverlay'

// Stand-in for the dynamically-imported AiChat. The panel variant renders
// the ChatHeader close (X) when `onClose` is provided, and reports its sheet
// state via `onSheetStateChange` once a conversation has messages. We expose
// both as buttons so the spec can drive the overlay's behaviour without the
// real chat implementation.
vi.mock('../AiChat', () => ({
  __esModule: true,
  AiChat: ({
    variant,
    onClose,
    onSheetStateChange
  }: {
    variant?: 'panel' | 'overlay'
    onClose?: () => void
    onSheetStateChange?: (state: 'idle' | 'active') => void
  }) => (
    <div data-testid="AiChatMock" data-variant={variant}>
      <button onClick={onClose}>mock-close</button>
      <button onClick={() => onSheetStateChange?.('active')}>
        mock-activate
      </button>
    </div>
  )
}))

describe('ChatOverlay', () => {
  it('renders nothing when closed', () => {
    render(<ChatOverlay open={false} onClose={vi.fn()} />)
    expect(screen.queryByTestId('ChatOverlay')).not.toBeInTheDocument()
  })

  it('renders the panel variant of AiChat (compact bar layout)', async () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    expect(await screen.findByTestId('AiChatMock')).toHaveAttribute(
      'data-variant',
      'panel'
    )
  })

  it('opens compact at 144px in the idle state', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const panel = screen.getByTestId('ChatOverlayPanel')
    expect(panel).toHaveAttribute('data-sheet-state', 'idle')
    expect(panel).toHaveStyle({ height: '144px' })
  })

  it('grows to 80% once AiChat reports messages (active state)', async () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const panel = screen.getByTestId('ChatOverlayPanel')
    expect(panel).toHaveStyle({ height: '144px' })

    fireEvent.click(
      await screen.findByRole('button', { name: 'mock-activate' })
    )

    expect(panel).toHaveAttribute('data-sheet-state', 'active')
    expect(panel).toHaveStyle({ height: '80%' })
  })

  it('closes via the AiChat panel close control (no separate corner X)', async () => {
    const onClose = vi.fn()
    render(<ChatOverlay open onClose={onClose} />)

    fireEvent.click(await screen.findByRole('button', { name: 'mock-close' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    // The overlay no longer renders its own top-right close button — the
    // panel ChatHeader owns the single close affordance (mobile parity).
    expect(
      screen.queryByRole('button', { name: 'Close chat' })
    ).not.toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ChatOverlay open onClose={onClose} />)

    // The backdrop is the aria-hidden sibling that fills the overlay.
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]') as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
