import { ReactElement } from 'react'
import { CardPreview } from '../../CardPreview'
import { Attributes } from './Attributes'

export function ControlPanel(): ReactElement {
  return (
    <>
      <div>ControlPanel</div>
      <Attributes />
      <CardPreview steps={[]} />
    </>
  )
}
