import { useChat } from '@ai-sdk/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import { AiChat } from './AiChat'

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn()
}))

// `ai` transitively loads streaming machinery that needs `TransformStream`
// (absent in jsdom). `useChat` is mocked, so the transport is never
// exercised — stub it to a constructable no-op.
vi.mock('ai', () => ({
  DefaultChatTransport: class DefaultChatTransport {}
}))

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('../../libs/JourneyProvider', () => ({
  useJourney: () => ({ journey: undefined })
}))

// Conversation owns scroll/ResizeObserver machinery that jsdom lacks; the
// error-state behaviour under test lives in AiChat itself, so render its
// children directly.
vi.mock('../Conversation', () => ({
  Conversation: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="conversation">{children}</div>
  )
}))

vi.mock('../PromptInput', () => ({
  PromptInput: ({ disabled }: { disabled?: boolean }) => (
    <div data-testid="prompt-input" data-disabled={String(disabled === true)} />
  )
}))

// `Response` pulls in react-markdown (heavy ESM) and is only rendered for
// assistant messages — never in the error states under test, so stub it out.
vi.mock('../Response', () => ({
  Response: ({ content }: { content: string }) => <div>{content}</div>
}))

const mockUseChat = useChat as unknown as Mock

const mockRegenerate = vi.fn()
const mockSetMessages = vi.fn()
const mockClearError = vi.fn()

function setChatState(
  overrides: Partial<{
    messages: unknown[]
    status: string
    error: Error | undefined
  }> = {}
): void {
  mockUseChat.mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    regenerate: mockRegenerate,
    stop: vi.fn(),
    status: 'error',
    error: undefined,
    setMessages: mockSetMessages,
    clearError: mockClearError,
    ...overrides
  } as unknown as ReturnType<typeof useChat>)
}

function codedError(code: string): Error {
  return new Error(JSON.stringify({ error: 'failure', code }))
}

describe('AiChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('error states — catered message + retry-gating (NES-1663)', () => {
    it('shows the catered cap-hit message + reset action, disables input, and hides Retry when capped', () => {
      setChatState({ error: codedError('conversation_capped') })

      render(<AiChat variant="overlay" collapsible={false} />)

      // Catered, session-specific copy that mentions clearing the session.
      expect(
        screen.getByText(
          /start a new one to keep chatting.*clears the current session/i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Something went wrong/i)
      ).not.toBeInTheDocument()
      // Retry is replaced by the reset action — re-firing a max-size prompt is
      // precisely the cost we must not hand to the user.
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
      // Input is locked: the only way forward is starting a new conversation.
      expect(screen.getByTestId('prompt-input')).toHaveAttribute(
        'data-disabled',
        'true'
      )
    })

    it('resets the conversation in place when the cap-hit action is clicked', () => {
      setChatState({ error: codedError('conversation_capped') })

      render(<AiChat variant="overlay" collapsible={false} />)

      fireEvent.click(
        screen.getByRole('button', { name: 'Start a new conversation' })
      )

      // Clears the resent history (drops the server-side size cap) and the
      // error state — works identically on overlay and pinned bar.
      expect(mockSetMessages).toHaveBeenCalledWith([])
      expect(mockClearError).toHaveBeenCalledTimes(1)
    })

    it('shows the generic message and Retry for a transient error', () => {
      // A mid-stream / network failure surfaces as a non-JSON message → no
      // code → retriable.
      setChatState({ error: new Error('stream failed') })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      const retry = screen.getByRole('button', { name: 'Retry' })
      expect(retry).toBeInTheDocument()
      // A transient error is not the cap — the input stays usable and there's
      // no reset action.
      expect(screen.getByTestId('prompt-input')).toHaveAttribute(
        'data-disabled',
        'false'
      )
      expect(
        screen.queryByRole('button', { name: 'Start a new conversation' })
      ).not.toBeInTheDocument()

      fireEvent.click(retry)
      expect(mockRegenerate).toHaveBeenCalledTimes(1)
    })

    it('shows Retry for a 503-style error whose JSON body carries no code', () => {
      // The provider-unconfigured 503 returns `{ error: '...' }` with no
      // `code` — parsed, but unrecognised → retriable.
      setChatState({
        error: new Error(
          JSON.stringify({ error: 'provider is not configured' })
        )
      })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('hides Retry for a deterministic invalid_request error', () => {
      setChatState({ error: codedError('invalid_request') })

      render(<AiChat variant="overlay" collapsible={false} />)

      // Not the cap-hit, so the generic message is shown…
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      // …but Retry stays hidden — re-sending the same malformed body 400s again.
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('hides Retry for a deterministic not_found (flag-off) error', () => {
      setChatState({ error: codedError('not_found') })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('does not render the error block while a request is still in flight', () => {
      setChatState({
        status: 'streaming',
        error: codedError('conversation_capped')
      })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(
        screen.queryByText(/start a new one to keep chatting/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })
  })
})
