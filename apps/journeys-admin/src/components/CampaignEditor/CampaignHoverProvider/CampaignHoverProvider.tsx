import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore
} from 'react'

/**
 * The element id the pointer is over on the canvas, or undefined. A store
 * rather than state: the canvas writes it on every mouse move and only the
 * Navigator's rows read it, so no section re-renders on hover.
 */
export interface CampaignHoverStore {
  set: (id: string | undefined) => void
  get: () => string | undefined
  subscribe: (listener: () => void) => () => void
}

export function createCampaignHoverStore(): CampaignHoverStore {
  let hoveredId: string | undefined
  const listeners = new Set<() => void>()
  return {
    set(id) {
      if (id === hoveredId) return
      hoveredId = id
      listeners.forEach((listener) => listener())
    },
    get: () => hoveredId,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}

const CampaignHoverContext = createContext<CampaignHoverStore | undefined>(
  undefined
)

interface CampaignHoverProviderProps {
  children: ReactNode
}

/** Holds the canvas → Navigator hover store. The context value never changes, so it re-renders nothing. */
export function CampaignHoverProvider({
  children
}: CampaignHoverProviderProps): ReactElement {
  const [store] = useState(createCampaignHoverStore)
  return (
    <CampaignHoverContext.Provider value={store}>
      {children}
    </CampaignHoverContext.Provider>
  )
}

const NO_HOVER_STORE: CampaignHoverStore = {
  set: () => undefined,
  get: () => undefined,
  subscribe: () => () => undefined
}

/** True while the canvas pointer is over the element with this id; re-renders only when that changes. */
export function useCanvasHovered(id: string): boolean {
  const store = useContext(CampaignHoverContext) ?? NO_HOVER_STORE
  return useSyncExternalStore(
    store.subscribe,
    () => store.get() === id,
    () => false
  )
}

/** The attribute that marks a canvas element the Navigator can highlight and outline. */
export const HOVERABLE_ATTRIBUTE = 'data-hoverable'

interface CanvasHoverReporterProps {
  /** The canvas frame's document. */
  document: Document
}

/**
 * Reports which hoverable canvas element the pointer is over to the
 * Navigator. One delegated listener on the frame's document, so the sections
 * themselves carry no hover handlers. Renders nothing.
 */
export function CanvasHoverReporter({
  document
}: CanvasHoverReporterProps): ReactElement {
  const store = useContext(CampaignHoverContext)
  useEffect(() => {
    if (store == null) return
    function handleMouseOver(event: MouseEvent): void {
      // The frame is another realm, so `instanceof Element` would be false.
      const target = event.target as Partial<Element> | null
      const hoverable = target?.closest?.(`[${HOVERABLE_ATTRIBUTE}]`)
      store?.set(hoverable?.id === '' ? undefined : hoverable?.id)
    }
    function handleMouseLeave(): void {
      store?.set(undefined)
    }
    document.addEventListener('mouseover', handleMouseOver)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.documentElement.removeEventListener(
        'mouseleave',
        handleMouseLeave
      )
      store.set(undefined)
    }
  }, [document, store])
  return <></>
}
