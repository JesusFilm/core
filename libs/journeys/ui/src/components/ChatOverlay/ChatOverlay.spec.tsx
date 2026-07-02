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
    onSheetStateChange,
    onDark
  }: {
    variant?: 'panel' | 'overlay'
    onClose?: () => void
    onSheetStateChange?: (state: 'idle' | 'active') => void
    onDark?: boolean
  }) => (
    <div
      data-testid="AiChatMock"
      data-variant={variant}
      data-on-dark={String(onDark === true)}
    >
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

  it('themes the panel for the dark backdrop (onDark)', async () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    expect(await screen.findByTestId('AiChatMock')).toHaveAttribute(
      'data-on-dark',
      'true'
    )
  })

  it('gives the background overlay a rounded top + contrasting top border', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]') as HTMLElement
    expect(backdrop).toHaveStyle({
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.12)'
    })
  })

  it('opens compact at 144px in the idle state', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    expect(screen.getByTestId('ChatOverlay')).toHaveStyle({ height: '144px' })
    expect(screen.getByTestId('ChatOverlayPanel')).toHaveAttribute(
      'data-sheet-state',
      'idle'
    )
  })

  it('grows to 80% once AiChat reports messages (active state)', async () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const overlay = screen.getByTestId('ChatOverlay')
    expect(overlay).toHaveStyle({ height: '144px' })

    fireEvent.click(
      await screen.findByRole('button', { name: 'mock-activate' })
    )

    expect(screen.getByTestId('ChatOverlayPanel')).toHaveAttribute(
      'data-sheet-state',
      'active'
    )
    expect(overlay).toHaveStyle({ height: '80%' })
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

  // QA-538: the overlay must never cover the journey above the chat. It used
  // to be a full-viewport fixed layer that silently swallowed clicks on the
  // revealed card (poll options, nav arrows); the container is now a
  // bottom-anchored band exactly as tall as the sheet, so everything above it
  // stays natively interactive. jsdom does no hit-testing, so pin the band
  // geometry directly (grow-to-80% is covered by the active-state test).
  it('only occupies the chat band, leaving the journey above interactive (QA-538)', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    expect(screen.getByTestId('ChatOverlay')).toHaveStyle({
      position: 'fixed',
      bottom: '0px',
      height: '144px'
    })
  })

  it('fills the band with the dark surface and the chat panel', () => {
    render(<ChatOverlay open onClose={vi.fn()} />)
    const backdrop = screen
      .getByTestId('ChatOverlay')
      .querySelector('[aria-hidden]') as HTMLElement
    expect(backdrop).toHaveStyle({
      position: 'absolute',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    })
    expect(screen.getByTestId('ChatOverlayPanel')).toHaveStyle({
      height: '100%'
    })
  })
})
