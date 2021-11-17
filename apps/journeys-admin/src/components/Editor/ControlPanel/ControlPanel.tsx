import { ReactElement } from 'react'
import { Attributes } from './Attributes'
import { CardNavigation } from './CardNavigation'

export function ControlPanel(): ReactElement {
  return (
    <>
      <div>ControlPanel</div>
      <Attributes />
      <CardNavigation />
    </>
  )
}
