import { ReactNode } from 'react'
import { HotkeysProvider, useHotkeys } from 'react-hotkeys-hook'

interface HotkeysWrapperProps {
  children: ReactNode
}

function HotkeysManager({ children }: HotkeysWrapperProps): ReactNode {
  useHotkeys('ctrl+z, mod+z', () => console.log('pressed'), {
    preventDefault: true
  })
  return <>{children}</>
}

export function HotkeysWrapper({ children }: HotkeysWrapperProps): ReactNode {
  return (
    <HotkeysProvider>
      <HotkeysManager>{children}</HotkeysManager>
    </HotkeysProvider>
  )
}
