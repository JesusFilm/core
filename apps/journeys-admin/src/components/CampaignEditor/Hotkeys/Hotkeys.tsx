import { ReactElement } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { useCampaignEditor } from '../CampaignEditorProvider'

const SELECT_SELECTOR = '[role=combobox], [role=listbox]'

/**
 * Whether the key event came from inside a (possibly open) select. The frame is
 * another realm, so `instanceof Element` would be false there.
 */
function isInsideSelect(event: KeyboardEvent): boolean {
  const target = event.target as Partial<Element> | null
  return target?.closest?.(SELECT_SELECTOR) != null
}

interface HotkeysProps {
  /** The canvas iframe's document; omitted for the editor shell itself. */
  document?: Document
}

/**
 * The editor's shortcuts: ⌘Z / ⇧⌘Z for undo and redo, Escape to close the open
 * left panel and otherwise step the selection up one level (blurring an
 * inline input first), P, A and Z to toggle the Pages, Add and Navigator panels,
 * Option+Z to expand or collapse the whole Navigator tree, S and D to switch
 * the Inspector's Style and Settings tab. Rendered once for the shell and
 * once inside the canvas frame, whose key events never reach the parent
 * document. Only the frame listens to undo and redo while a form field has
 * focus: its inline inputs are Commands, whereas the shell's fields (the
 * Inspector's settings) are not and keep their native undo. The letters never
 * fire while an input or textarea has focus, or from within a select (its
 * trigger or open listbox), in either document.
 */
export function Hotkeys({ document }: HotkeysProps): ReactElement {
  const { undo, redo } = useCommand()
  const {
    escape,
    dispatch,
    state: { panel }
  } = useCampaignEditor()
  const options = {
    document,
    enableOnFormTags: document != null,
    preventDefault: true
  }
  const letterOptions = { document, enableOnFormTags: false }

  function letterHotkey(handler: () => void): (event: KeyboardEvent) => void {
    return (event) => {
      if (isInsideSelect(event)) return
      handler()
    }
  }

  useHotkeys('mod+z', undo, options)
  useHotkeys('mod+shift+z', redo, options)
  useHotkeys(
    'escape',
    (event) => {
      // A menu or dialog opened from a panel closes itself on Escape first.
      const target = event.target as Partial<Element> | null
      if (target?.closest?.('.MuiModal-root') != null) return
      const active = (document ?? window.document)
        .activeElement as Partial<HTMLElement> | null
      active?.blur?.()
      if (panel !== 'none') {
        dispatch({ type: 'SetPanelAction', panel })
        return
      }
      escape()
    },
    options
  )
  useHotkeys(
    'p',
    letterHotkey(() => dispatch({ type: 'SetPanelAction', panel: 'pages' })),
    letterOptions
  )
  useHotkeys(
    'a',
    letterHotkey(() => dispatch({ type: 'SetPanelAction', panel: 'add' })),
    letterOptions
  )
  useHotkeys(
    'z',
    letterHotkey(() =>
      dispatch({ type: 'SetPanelAction', panel: 'navigator' })
    ),
    letterOptions
  )
  useHotkeys(
    'alt+z',
    letterHotkey(() => dispatch({ type: 'ToggleNavigatorExpandAction' })),
    letterOptions
  )
  useHotkeys(
    's',
    letterHotkey(() =>
      dispatch({ type: 'SetInspectorTabAction', inspectorTab: 'style' })
    ),
    letterOptions
  )
  useHotkeys(
    'd',
    letterHotkey(() =>
      dispatch({ type: 'SetInspectorTabAction', inspectorTab: 'settings' })
    ),
    letterOptions
  )

  return <></>
}
