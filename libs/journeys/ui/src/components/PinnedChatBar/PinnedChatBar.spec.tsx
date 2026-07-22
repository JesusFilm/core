import { fireEvent, render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import {
  ChatOverlayProvider,
  useChatOverlay
} from '../../libs/ChatOverlayProvider'

import { PinnedChatBar } from './PinnedChatBar'

const { mockUseJourney } = vi.hoisted(() => ({
  mockUseJourney: vi.fn(() => ({ renderMode: 'default' }))
}))

vi.mock('../../libs/JourneyProvider', () => ({
  useJourney: mockUseJourney
}))

vi.mock('../AiChat', () => ({
  __esModule: true,
  AiChat: ({
    onClose,
    onSheetStateChange
  }: {
    onClose?: () => void
    onSheetStateChange?: (state: 'idle' | 'active') => void
  }) => (
    <div data-testid="AiChatMock">
      <button onClick={onClose}>mock-close</button>
      <button onClick={() => onSheetStateChange?.('active')}>
        mock-activate
      </button>
    </div>
  )
}))

// Stand-in for the StepFooter's AiChatButton: lifts `open` into the same
// ChatOverlayProvider state the drawer consumes.
function OpenChatButton(): ReactElement {
  const { setOpen } = useChatOverlay()
  return <button onClick={() => setOpen(true)}>open-chat</button>
}

function renderBar() {
  return render(
    <ChatOverlayProvider journeyId="journeyId">
      <OpenChatButton />
      <PinnedChatBar />
    </ChatOverlayProvider>
  )
}

describe('PinnedChatBar', () => {
  beforeEach(() => {
    mockUseJourney.mockReturnValue({ renderMode: 'default' })
    window.sessionStorage.clear()
  })

  it('renders nothing in admin render mode', () => {
    mockUseJourney.mockReturnValue({ renderMode: 'admin' })
    renderBar()
    expect(screen.queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
  })

  it('renders nothing in embed render mode', () => {
    mockUseJourney.mockReturnValue({ renderMode: 'embed' })
    renderBar()
    expect(screen.queryByTestId('PinnedChatBar')).not.toBeInTheDocument()
  })

  it('starts closed and opens when the shared provider open state flips', () => {
    renderBar()
    const bar = screen.getByTestId('PinnedChatBar')
    expect(bar).toHaveAttribute('data-open', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'open-chat' }))
    expect(bar).toHaveAttribute('data-open', 'true')
  })

  it('closes via the AiChat close control but stays mounted (conversation survives reopen)', async () => {
    renderBar()
    fireEvent.click(screen.getByRole('button', { name: 'open-chat' }))

    fireEvent.click(await screen.findByRole('button', { name: 'mock-close' }))

    const bar = screen.getByTestId('PinnedChatBar')
    expect(bar).toHaveAttribute('data-open', 'false')
    // The drawer (and the AiChat inside it) must not unmount on close —
    // unmounting would drop the useChat message state, so reopening
    // would land on an empty idle sheet instead of the conversation.
    expect(screen.getByTestId('AiChatMock')).toBeInTheDocument()
  })

  it('reflects the sheet state reported by AiChat (idle → active drives the 80% height)', async () => {
    renderBar()
    fireEvent.click(screen.getByRole('button', { name: 'open-chat' }))
    expect(screen.getByTestId('PinnedChatBar')).toHaveAttribute(
      'data-sheet-state',
      'idle'
    )

    fireEvent.click(
      await screen.findByRole('button', { name: 'mock-activate' })
    )
    expect(screen.getByTestId('PinnedChatBar')).toHaveAttribute(
      'data-sheet-state',
      'active'
    )
  })
})
