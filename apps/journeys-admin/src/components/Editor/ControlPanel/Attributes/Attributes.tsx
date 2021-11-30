import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import { Actions } from './Actions'

interface AttributesProps {
  selected?: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
  return (
    <>
      <div>Attributes</div>
      <Actions />
    </>
  )
}
