import { act, render, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import { ChatOverlayProvider, useChatOverlay } from './ChatOverlayProvider'

function wrapper(journeyId: string | undefined) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ChatOverlayProvider journeyId={journeyId}>{children}</ChatOverlayProvider>
    )
  }
}

describe('ChatOverlayProvider', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  describe('shouldAutoOpen', () => {
    it('returns true on first call and false thereafter for same (journeyId, cardId)', () => {
      const { result } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey1')
      })

      expect(result.current.shouldAutoOpen('cardA')).toBe(true)
      act(() => result.current.markAutoOpened('cardA'))
      expect(result.current.shouldAutoOpen('cardA')).toBe(false)
      expect(result.current.shouldAutoOpen('cardA')).toBe(false)
    })

    it('returns false when journeyId is missing', () => {
      const { result } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper(undefined)
      })

      expect(result.current.shouldAutoOpen('cardA')).toBe(false)
    })

    it('does not collide across different journeyIds with the same cardId', () => {
      const { result: result1 } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey1')
      })
      act(() => result1.current.markAutoOpened('cardA'))

      const { result: result2 } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey2')
      })
      expect(result2.current.shouldAutoOpen('cardA')).toBe(true)
    })
  })

  describe('markAutoOpened', () => {
    it('writes the expected sessionStorage key', () => {
      const { result } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey1')
      })

      act(() => result.current.markAutoOpened('cardA'))

      expect(
        window.sessionStorage.getItem('apologistChat:autoOpened:journey1:cardA')
      ).toBe('1')
    })

    it('persists across remounts (in-tab dedup survives)', () => {
      const { result: first, unmount } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey1')
      })
      act(() => first.current.markAutoOpened('cardA'))
      unmount()

      const { result: second } = renderHook(() => useChatOverlay(), {
        wrapper: wrapper('journey1')
      })
      expect(second.current.shouldAutoOpen('cardA')).toBe(false)
    })
  })

  describe('open lifecycle', () => {
    it('clears open=true when journeyId changes', () => {
      let journeyId = 'journey1'
      const { result, rerender } = renderHook(() => useChatOverlay(), {
        wrapper: ({ children }) => (
          <ChatOverlayProvider journeyId={journeyId}>
            {children}
          </ChatOverlayProvider>
        )
      })

      act(() => result.current.setOpen(true))
      expect(result.current.open).toBe(true)

      journeyId = 'journey2'
      rerender()
      expect(result.current.open).toBe(false)
    })
  })

  describe('useChatOverlay outside provider', () => {
    it('returns a no-op fallback', () => {
      const { result } = renderHook(() => useChatOverlay())
      expect(result.current.open).toBe(false)
      expect(result.current.shouldAutoOpen('cardA')).toBe(false)
      // setOpen / markAutoOpened are no-ops; calling them must not throw.
      act(() => {
        result.current.setOpen(true)
        result.current.markAutoOpened('cardA')
      })
      expect(result.current.open).toBe(false)
    })
  })

  it('renders children', () => {
    const { getByText } = render(
      <ChatOverlayProvider journeyId="journey1">
        <div>child</div>
      </ChatOverlayProvider>
    )
    expect(getByText('child')).toBeInTheDocument()
  })
})
