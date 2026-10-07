import { ReactElement } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { useCampaignEditor } from '../CampaignEditorProvider'

interface HotkeysProps {
  /** The canvas iframe's document; omitted for the editor shell itself. */
  document?: Document
}

/**
 * The editor's only shortcuts: ⌘Z / ⇧⌘Z for undo and redo, Escape to step
 * the selection up one level (blurring an inline input first). Rendered once
 * for the shell and once inside the canvas frame, whose key events never
 * reach the parent document. Only the frame listens while a form field has
 * focus: its inline inputs are Commands, whereas the shell's fields (the
 * Settings drawer) are not and keep their native undo.
 */
export function Hotkeys({ document }: HotkeysProps): ReactElement {
  const { undo, redo } = useCommand()
  const { escape } = useCampaignEditor()
  const options = {
    document,
    enableOnFormTags: document != null,
    preventDefault: true
  }

  useHotkeys('mod+z', undo, options)
  useHotkeys('mod+shift+z', redo, options)
  useHotkeys(
    'escape',
    () => {
      const active = (document ?? window.document).activeElement
      if (active instanceof HTMLElement) active.blur()
      escape()
    },
    options
  )

  return <></>
}
