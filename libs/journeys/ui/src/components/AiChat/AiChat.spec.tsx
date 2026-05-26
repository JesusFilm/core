import { useChat } from '@ai-sdk/react'
import { fireEvent, render, screen } from '@testing-library/react'

import { AiChat } from './AiChat'

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn()
}))

// `ai` transitively loads streaming machinery that needs `TransformStream`
// (absent in jsdom). `useChat` is mocked, so the transport is never
// exercised — stub it to a constructable no-op.
jest.mock('ai', () => ({
  DefaultChatTransport: class DefaultChatTransport {}
}))

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock('../../libs/JourneyProvider', () => ({
  useJourney: () => ({ journey: undefined })
}))

// Conversation owns scroll/ResizeObserver machinery that jsdom lacks; the
// error-state behaviour under test lives in AiChat itself, so render its
// children directly.
jest.mock('../Conversation', () => ({
  Conversation: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="conversation">{children}</div>
  )
}))

jest.mock('../PromptInput', () => ({
  PromptInput: () => <div data-testid="prompt-input" />
}))

// `Response` pulls in react-markdown (ESM-only, untransformed by jest) and is
// only rendered for assistant messages — never in the error states under test.
jest.mock('../Response', () => ({
  Response: ({ content }: { content: string }) => <div>{content}</div>
}))

const mockUseChat = useChat as unknown as jest.Mock

const mockRegenerate = jest.fn()

function setChatState(
  overrides: Partial<{
    messages: unknown[]
    status: string
    error: Error | undefined
  }> = {}
): void {
  mockUseChat.mockReturnValue({
    messages: [],
    sendMessage: jest.fn(),
    regenerate: mockRegenerate,
    stop: jest.fn(),
    status: 'error',
    error: undefined,
    ...overrides
  } as unknown as ReturnType<typeof useChat>)
}

function codedError(code: string): Error {
  return new Error(JSON.stringify({ error: 'failure', code }))
}

describe('AiChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('error states — catered message + retry-gating (NES-1663)', () => {
    it('shows the catered cap-hit message and hides Retry when capped', () => {
      setChatState({ error: codedError('conversation_capped') })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(
        screen.getByText(/close and reopen the chat to start a fresh one/i)
      ).toBeInTheDocument()
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument()
      // For the cap-hit the catered message replaces Retry — re-firing a
      // max-size prompt is precisely the cost we must not hand to the user.
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('shows the generic message and Retry for a transient error', () => {
      // A mid-stream / network failure surfaces as a non-JSON message → no
      // code → retriable.
      setChatState({ error: new Error('stream failed') })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      const retry = screen.getByRole('button', { name: 'Retry' })
      expect(retry).toBeInTheDocument()

      fireEvent.click(retry)
      expect(mockRegenerate).toHaveBeenCalledTimes(1)
    })

    it('shows Retry for a 503-style error whose JSON body carries no code', () => {
      // The provider-unconfigured 503 returns `{ error: '...' }` with no
      // `code` — parsed, but unrecognised → retriable.
      setChatState({
        error: new Error(JSON.stringify({ error: 'provider is not configured' }))
      })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Retry' })
      ).toBeInTheDocument()
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
      setChatState({ status: 'streaming', error: codedError('conversation_capped') })

      render(<AiChat variant="overlay" collapsible={false} />)

      expect(
        screen.queryByText(/close and reopen the chat to start a fresh one/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })
  })
})
