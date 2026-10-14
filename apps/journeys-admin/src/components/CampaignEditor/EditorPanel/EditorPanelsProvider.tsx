import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'

/**
 * Where the editor's panels (Style, Edit, Theme, Settings, …) show:
 * `docked` is one inspector column to the right of the canvas, which
 * narrows to make room; `floating` is a card over the canvas's right edge.
 * Neither is modal: the canvas stays visible and clickable behind them.
 */
export type EditorPanelMode = 'docked' | 'floating'

export const EDITOR_PANEL_MODE_KEY = 'campaignEditorPanelMode'
export const DEFAULT_EDITOR_PANEL_MODE: EditorPanelMode = 'docked'
export const DOCKED_PANEL_WIDTH = 340
export const FLOATING_PANEL_WIDTH = 340

interface ActivePanel {
  id: string
  docked: boolean
  onClose: () => void
}

export interface EditorPanelsContextValue {
  mode: EditorPanelMode
  setMode: (mode: EditorPanelMode) => void
  /** The open panel's id; one panel shows at a time. */
  activeId: string | null
  /** True while the open panel renders in the docked column. */
  dockOpen: boolean
  /** The docked column every docked panel portals into; null until the shell mounts it. */
  dockElement: HTMLElement | null
  setDockElement: (element: HTMLElement | null) => void
  /** Makes a panel the open one, closing whichever was open before. */
  activate: (id: string, docked: boolean, onClose: () => void) => void
  deactivate: (id: string) => void
}

function noop(): void {
  // The default context has nothing to do.
}

/** Without a provider (component specs) panels float and nothing closes them but their own controls. */
const EditorPanelsContext = createContext<EditorPanelsContextValue>({
  mode: 'floating',
  setMode: noop,
  activeId: null,
  dockOpen: false,
  dockElement: null,
  setDockElement: noop,
  activate: noop,
  deactivate: noop
})

function readStoredMode(): EditorPanelMode {
  try {
    const stored = window.localStorage.getItem(EDITOR_PANEL_MODE_KEY)
    return stored === 'docked' || stored === 'floating'
      ? stored
      : DEFAULT_EDITOR_PANEL_MODE
  } catch {
    return DEFAULT_EDITOR_PANEL_MODE
  }
}

interface EditorPanelsProviderProps {
  children: ReactNode
}

export function EditorPanelsProvider({
  children
}: EditorPanelsProviderProps): ReactElement {
  const [mode, setModeState] = useState<EditorPanelMode>(readStoredMode)
  const [active, setActive] = useState<ActivePanel | null>(null)
  const activeRef = useRef<ActivePanel | null>(null)
  const [dockElement, setDockElement] = useState<HTMLElement | null>(null)

  const setMode = useCallback((next: EditorPanelMode): void => {
    setModeState(next)
    try {
      window.localStorage.setItem(EDITOR_PANEL_MODE_KEY, next)
    } catch {
      // The preference is a convenience; losing it costs nothing.
    }
  }, [])

  const activate = useCallback(
    (id: string, docked: boolean, onClose: () => void): void => {
      const previous = activeRef.current
      if (previous != null && previous.id !== id) previous.onClose()
      const next = { id, docked, onClose }
      activeRef.current = next
      setActive(next)
    },
    []
  )

  const deactivate = useCallback((id: string): void => {
    if (activeRef.current?.id !== id) return
    activeRef.current = null
    setActive(null)
  }, [])

  const value = useMemo<EditorPanelsContextValue>(
    () => ({
      mode,
      setMode,
      activeId: active?.id ?? null,
      dockOpen: active?.docked === true,
      dockElement,
      setDockElement,
      activate,
      deactivate
    }),
    [mode, setMode, active, dockElement, activate, deactivate]
  )

  return (
    <EditorPanelsContext.Provider value={value}>
      {children}
    </EditorPanelsContext.Provider>
  )
}

export function useEditorPanels(): EditorPanelsContextValue {
  return useContext(EditorPanelsContext)
}
