import { ReactElement } from 'react'
import { StepType } from '../../../types'
import { BlockRenderer } from '../../BlockRenderer'

export function Step ({
  children
}: StepType): ReactElement {
  return (
    <>
      {children?.map((block) => <BlockRenderer {...block} key={block.id} />)}
    </>
  )
}
