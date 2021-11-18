import { ReactElement } from 'react'
import { Attributes } from './Attributes'
import { Navigation } from './Navigation'

export function ControlPanel(): ReactElement {
  return (
    <>
      <div>ControlPanel</div>
      <Attributes />
      <Navigation steps={[]} />
    </>
  )
}
