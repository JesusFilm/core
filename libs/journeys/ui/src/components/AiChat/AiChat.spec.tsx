import { useChat } from '@ai-sdk/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import { type TreeBlock, blockHistoryVar } from '../../libs/block'

import { AiChat } from './AiChat'

const { mockTransportConstructor, mockUseJourney } = vi.hoisted(() => ({
  mockTransportConstructor: vi.fn(),
  mockUseJourney: vi.fn()
}))

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn()
}))

// `ai` transitively loads streaming machinery that needs `TransformStream`
// (absent in jsdom). `useChat` is mocked, so the transport is never
// exercised — stub it to a constructable no-op that records its options so
// tests can assert the request body (NES-1679).
vi.mock('ai', () => ({
  DefaultChatTransport: class DefaultChatTransport {
    constructor(options: unknown) {
      mockTransportConstructor(options)
    }
  }
}))

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('../../libs/JourneyProvider', () => ({
  useJourney: mockUseJourney
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

// Mock Message so the dark-panel tests can assert on the `surface` prop
// (light vs dark) directly, instead of depending on emotion's colour-class
// emission. Renders children + the surface as a data attribute.
vi.mock('../Message', () => ({
  Message: ({
    children,
    surface
  }: {
    children: React.ReactNode
    surface?: 'light' | 'dark'
    role?: string
    plain?: boolean
  }) => (
    <div data-testid="message" data-surface={surface ?? 'light'}>
      {children}
    </div>
  )
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
    // `clearAllMocks` clears calls but not return values — reset the journey
    // explicitly so a per-test `mockReturnValue` can't leak across tests.
    mockUseJourney.mockReturnValue({ journey: undefined })
    blockHistoryVar([])
  })

  describe('error states — catered message + retry-gating (NES-1663)', () => {
    it('shows the catered cap-hit message + reset action, disables input, and hides Retry when capped', () => {
      setChatState({ error: codedError('conversation_capped') })

      render(<AiChat variant="overlay" />)

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

      render(<AiChat variant="overlay" />)

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

      render(<AiChat variant="overlay" />)

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

      render(<AiChat variant="overlay" />)

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('hides Retry for a deterministic invalid_request error', () => {
      setChatState({ error: codedError('invalid_request') })

      render(<AiChat variant="overlay" />)

      // Not the cap-hit, so the generic message is shown…
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      // …but Retry stays hidden — re-sending the same malformed body 400s again.
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('hides Retry for a deterministic not_found (flag-off) error', () => {
      setChatState({ error: codedError('not_found') })

      render(<AiChat variant="overlay" />)

      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })

    it('shows the catered "turned off" message and hides Retry when chat is disabled', () => {
      setChatState({ error: codedError('chat_disabled') })

      render(<AiChat variant="overlay" />)

      // Honest copy instead of the misleading "try again" generic.
      expect(screen.getByText(/chat has been turned off/i)).toBeInTheDocument()
      expect(
        screen.queryByText(/Something went wrong/i)
      ).not.toBeInTheDocument()
      // Retry is hidden (re-firing 403s again)…
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
      // …but the input stays usable: the kill-switch floor keeps the stale tab
      // interactive, and locking it would strand a user who navigates to a card
      // where chat is still enabled.
      expect(screen.getByTestId('prompt-input')).toHaveAttribute(
        'data-disabled',
        'false'
      )
    })

    it('does not render the error block while a request is still in flight', () => {
      setChatState({
        status: 'streaming',
        error: codedError('conversation_capped')
      })

      render(<AiChat variant="overlay" />)

      expect(
        screen.queryByText(/start a new one to keep chatting/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Retry' })
      ).not.toBeInTheDocument()
    })
  })

  describe('overlay empty-state hero (NES-1654)', () => {
    // `showOverlayHero = isOverlay && messages.length === 0 && !isLoading && error == null`
    // is 4-input branching logic, not a static-config edit — these tests
    // guard the condition without testing the wave styling itself.

    it('shows when overlay variant is idle with no messages, error, or in-flight request', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      const hero = screen.getByTestId('overlay-hero')
      expect(hero).toBeInTheDocument()
      expect(hero).toHaveTextContent('Ask your questions about faith')
    })

    it('hides while a request is in flight (submitted)', () => {
      setChatState({ messages: [], status: 'submitted', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(screen.queryByTestId('overlay-hero')).not.toBeInTheDocument()
    })

    it('hides while a response is streaming', () => {
      setChatState({ messages: [], status: 'streaming', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(screen.queryByTestId('overlay-hero')).not.toBeInTheDocument()
    })

    it('hides once a message is present', () => {
      setChatState({
        messages: [
          {
            id: '1',
            role: 'user',
            parts: [{ type: 'text', text: 'hi' }]
          }
        ],
        status: 'ready',
        error: undefined
      })

      render(<AiChat variant="overlay" />)

      expect(screen.queryByTestId('overlay-hero')).not.toBeInTheDocument()
    })

    it('hides when an error is present', () => {
      setChatState({
        messages: [],
        status: 'ready',
        error: new Error('boom')
      })

      render(<AiChat variant="overlay" />)

      expect(screen.queryByTestId('overlay-hero')).not.toBeInTheDocument()
    })

    it('does not render on the panel variant', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="panel" />)

      expect(screen.queryByTestId('overlay-hero')).not.toBeInTheDocument()
    })
  })

  describe('about-this-chat disclosure link (NES-1588)', () => {
    // The disclosure link lives on exactly one surface per variant: the
    // ChatHeader in panel mode, the floating-input footer caption in overlay
    // mode (`showHeader = isPanel`). These guard both the safe external-link
    // attributes and the no-duplication invariant across the two surfaces.

    it('renders one disclosure link with safe external-link attributes in overlay mode', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      // Overlay suppresses ChatHeader, so the footer caption is the sole copy.
      const links = screen.getAllByRole('link', { name: 'About this chat' })
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute('href', '/legal/about-chat')
      expect(links[0]).toHaveAttribute('target', '_blank')
      expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders the disclosure link only in the header in panel mode', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="panel" />)

      // Panel shows the ChatHeader link; the overlay-only footer caption is
      // suppressed, so again exactly one copy renders.
      expect(
        screen.getAllByRole('link', { name: 'About this chat' })
      ).toHaveLength(1)
    })

    it('carries the journey language as ?lang on the disclosure link (NES-1724)', () => {
      mockUseJourney.mockReturnValue({
        journey: { language: { bcp47: 'es' } }
      })
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(
        screen.getByRole('link', { name: 'About this chat' })
      ).toHaveAttribute('href', '/legal/about-chat?lang=es')
    })
  })

  describe('close button (NES-1727)', () => {
    it('renders a close button in panel mode that calls onClose', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })
      const onClose = vi.fn()

      render(<AiChat variant="panel" onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not render a close button in panel mode without onClose', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="panel" />)

      expect(
        screen.queryByRole('button', { name: 'Close chat' })
      ).not.toBeInTheDocument()
    })

    it('does not render a close button in overlay mode (ChatOverlay owns its own)', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" onClose={vi.fn()} />)

      expect(
        screen.queryByRole('button', { name: 'Close chat' })
      ).not.toBeInTheDocument()
    })
  })

  describe('dark panel theming (NES-1738 Option B)', () => {
    // The panel variant is shared with the mobile PinnedChatBar (white
    // sheet). `onDark` re-themes only the desktop overlay's panel; the
    // mobile sheet leaves it false and stays light.

    it('threads onDark to ChatHeader → brighter overlay link colour', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="panel" onDark />)

      // OVERLAY_LINK_FG (#FF7A85) is the dark-surface link; PANEL_LINK_FG
      // (brandRed) is the light one. Asserting the dark token confirms the
      // prop reached the header.
      expect(screen.getByRole('link', { name: 'About this chat' })).toHaveStyle(
        { color: '#FF7A85' }
      )
    })

    it('keeps the light link colour on the panel without onDark (mobile sheet)', () => {
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="panel" />)

      // brandRed (#C52D3A) — the white-sheet link colour must not regress.
      expect(screen.getByRole('link', { name: 'About this chat' })).toHaveStyle(
        { color: '#C52D3A' }
      )
    })

    it('renders assistant prose with the dark token when onDark', () => {
      setChatState({
        messages: [
          {
            id: 'a1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hello there' }]
          }
        ],
        status: 'ready',
        error: undefined
      })

      render(<AiChat variant="panel" onDark />)

      // The plain-assistant Message receives surface="dark", which maps to
      // PLAIN_ASSISTANT_FG_ON_DARK so the reply reads on the dark backdrop.
      expect(screen.getByTestId('message')).toHaveAttribute(
        'data-surface',
        'dark'
      )
    })

    it('renders assistant prose with the light surface on the panel without onDark', () => {
      setChatState({
        messages: [
          {
            id: 'a1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hello there' }]
          }
        ],
        status: 'ready',
        error: undefined
      })

      render(<AiChat variant="panel" />)

      // The light panel (mobile sheet) keeps the light prose token.
      expect(screen.getByTestId('message')).toHaveAttribute(
        'data-surface',
        'light'
      )
    })
  })

  describe('chat request body (NES-1679)', () => {
    it('includes the active card id in the chat request body', () => {
      blockHistoryVar([
        {
          __typename: 'StepBlock',
          id: 'step-1',
          children: [{ __typename: 'CardBlock', id: 'card-1', children: [] }]
        }
      ] as unknown as TreeBlock[])
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      const options = mockTransportConstructor.mock.calls[0]?.[0] as {
        body: () => Record<string, unknown>
      }
      expect(options.body()).toMatchObject({ cardId: 'card-1' })
    })

    it('sends an undefined cardId when no card is active', () => {
      blockHistoryVar([])
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      const options = mockTransportConstructor.mock.calls[0]?.[0] as {
        body: () => Record<string, unknown>
      }
      expect(options.body().cardId).toBeUndefined()
    })
  })

  describe('language in chat request body (NES-1736)', () => {
    function getRequestLanguage(): unknown {
      const options = mockTransportConstructor.mock.calls[0]?.[0] as {
        body: () => Record<string, unknown>
      }
      return options.body().language
    }

    it('sends the human-readable language name, not the bcp47 code', () => {
      mockUseJourney.mockReturnValue({
        journey: {
          language: { bcp47: 'ur', name: [{ value: 'Urdu', primary: true }] }
        }
      })
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(getRequestLanguage()).toBe('Urdu')
    })

    it('also sends the raw bcp47 code alongside the resolved name', () => {
      mockUseJourney.mockReturnValue({
        journey: {
          language: { bcp47: 'ur', name: [{ value: 'Urdu', primary: true }] }
        }
      })
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      const options = mockTransportConstructor.mock.calls[0]?.[0] as {
        body: () => Record<string, unknown>
      }
      expect(options.body()).toMatchObject({
        language: 'Urdu',
        languageBcp47: 'ur'
      })
    })

    it('prefers the localized (non-primary) name when both names exist', () => {
      mockUseJourney.mockReturnValue({
        journey: {
          language: {
            bcp47: 'ur',
            name: [
              { value: 'Urdu', primary: false },
              { value: 'اردو', primary: true }
            ]
          }
        }
      })
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(getRequestLanguage()).toBe('Urdu')
    })

    it('falls back to the bcp47 code when no language name is available', () => {
      mockUseJourney.mockReturnValue({
        journey: { language: { bcp47: 'es' } }
      })
      setChatState({ messages: [], status: 'ready', error: undefined })

      render(<AiChat variant="overlay" />)

      expect(getRequestLanguage()).toBe('es')
    })
  })
})
