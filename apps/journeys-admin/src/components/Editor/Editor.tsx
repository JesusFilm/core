import { ReactElement } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { Tabs } from './Tabs'
import { TopBar } from './TopBar'

export function Editor(): ReactElement {
  return (
    <>
      <div>Editor</div>
      <TopBar />
      <Canvas steps={[]} />
      <Tabs />
      <ControlPanel />
    </>
  )
}
