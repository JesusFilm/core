import { ReactNode } from 'react'
import { HotkeysProvider, useHotkeys } from 'react-hotkeys-hook'
import { useCommand } from '../../CommandProvider'

interface HotkeysWrapperProps {
  children: ReactNode
}

function HotkeysManager({ children }: HotkeysWrapperProps): ReactNode {
  const { undo, redo } = useCommand()
  useHotkeys('mod+z', undo, { preventDefault: true })
  useHotkeys('mod+shift+z', redo, { preventDefault: true })

  return <>{children}</>
}

export function HotkeysWrapper({ children }: HotkeysWrapperProps): ReactNode {
  return (
    <HotkeysProvider>
      <HotkeysManager>{children}</HotkeysManager>
    </HotkeysProvider>
  )
}
