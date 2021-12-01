import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'

interface AttributesProps {
  selected: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
  return (
    <>
      <div>{selected.id}</div>
    </>
  )
}
