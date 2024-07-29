import { ReactElement } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCommand } from '../../../../../../libs/journeys/ui/src/libs/CommandProvider'

interface HotkeysProps {
  document?: Document
}

export function Hotkeys({ document }: HotkeysProps): ReactElement {
  const { undo, redo } = useCommand()
  useHotkeys('mod+z', undo, {
    document,
    enableOnFormTags: true,
    preventDefault: true
  })
  useHotkeys('mod+shift+z', redo, {
    document,
    enableOnFormTags: true,
    preventDefault: true
  })

  return <></>
}
