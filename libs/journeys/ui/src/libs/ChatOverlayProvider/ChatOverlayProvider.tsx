'use client'

import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

interface ChatOverlayContextValue {
  /** Whether the chat overlay is currently open. */
  open: boolean
  /** Set the open state directly. */
  setOpen: (next: boolean) => void
  /**
   * Returns true the first time it is called per `(journeyId, cardId)`
   * per browser tab. Subsequent calls (in the same tab, even after a
   * remount) return false.
   *
   * Backed by `sessionStorage` so the dedup survives:
   *   - React StrictMode double-invokes
   *   - per-card subtree remounts
   *   - in-tab navigation between cards
   *
   * Closing the tab resets the dedup; a full page reload also resets it.
   */
  shouldAutoOpen: (cardId: string) => boolean
  /** Marks `(journeyId, cardId)` as auto-opened in `sessionStorage`. */
  markAutoOpened: (cardId: string) => void
}

const ChatOverlayContext = createContext<ChatOverlayContextValue | undefined>(
  undefined
)

interface ChatOverlayProviderProps {
  /**
   * Stable identity for the current journey. Used to namespace the
   * `sessionStorage` dedup key so the same `cardId` belonging to two
   * different journeys does not collide. May be undefined while the
   * journey is loading; in that case `shouldAutoOpen` returns false.
   */
  journeyId?: string
  children: ReactNode
}

const STORAGE_PREFIX = 'apologistChat:autoOpened'

function buildKey(journeyId: string, cardId: string): string {
  return `${STORAGE_PREFIX}:${journeyId}:${cardId}`
}

export function ChatOverlayProvider({
  journeyId,
  children
}: ChatOverlayProviderProps): ReactElement {
  const [open, setOpenState] = useState(false)
  // In-memory cache mirroring sessionStorage so dedup still works in
  // environments where sessionStorage throws (e.g. private mode + quota).
  const inMemoryDedup = useRef<Set<string>>(new Set())

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next)
  }, [])

  // Close the overlay when the journey changes in the same tab.
  useEffect(() => {
    setOpenState(false)
  }, [journeyId])

  const shouldAutoOpen = useCallback(
    (cardId: string): boolean => {
      if (journeyId == null || journeyId === '' || cardId === '') return false
      const key = buildKey(journeyId, cardId)
      if (inMemoryDedup.current.has(key)) return false
      if (typeof window !== 'undefined') {
        try {
          if (window.sessionStorage.getItem(key) != null) {
            inMemoryDedup.current.add(key)
            return false
          }
        } catch {
          // sessionStorage unavailable; fall through to in-memory dedup.
        }
      }
      return true
    },
    [journeyId]
  )

  const markAutoOpened = useCallback(
    (cardId: string): void => {
      if (journeyId == null || journeyId === '' || cardId === '') return
      const key = buildKey(journeyId, cardId)
      inMemoryDedup.current.add(key)
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(key, '1')
        } catch {
          // sessionStorage unavailable; in-memory dedup still applies.
        }
      }
    },
    [journeyId]
  )

  const value = useMemo<ChatOverlayContextValue>(
    () => ({ open, setOpen, shouldAutoOpen, markAutoOpened }),
    [open, setOpen, shouldAutoOpen, markAutoOpened]
  )

  return (
    <ChatOverlayContext.Provider value={value}>
      {children}
    </ChatOverlayContext.Provider>
  )
}

/**
 * Hook for consuming chat overlay state. When called outside a
 * `ChatOverlayProvider`, returns a no-op fallback so legacy renderers
 * (e.g. journeys-admin previews) continue to work without wrapping.
 */
export function useChatOverlay(): ChatOverlayContextValue {
  const ctx = useContext(ChatOverlayContext)
  if (ctx != null) return ctx
  return FALLBACK_CONTEXT
}

const FALLBACK_CONTEXT: ChatOverlayContextValue = {
  open: false,
  setOpen: () => {
    /* no-op when used outside a provider */
  },
  shouldAutoOpen: () => false,
  markAutoOpened: () => {
    /* no-op when used outside a provider */
  }
}
