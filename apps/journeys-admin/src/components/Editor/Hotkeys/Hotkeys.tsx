import { ReactElement } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCommand } from '../../../../../../libs/journeys/ui/src/libs/CommandProvider'

export function Hotkeys(): ReactElement {
  const { undo, redo } = useCommand()
  useHotkeys('mod+z', undo, { preventDefault: true })
  useHotkeys('mod+shift+z', redo, { preventDefault: true })

  return <></>
}
