import { TreeBlock } from '../../'
import { ReactElement } from 'react'
import { BlockRenderer } from '../BlockRenderer'
import { StepFields } from './__generated__/StepFields'

export function Step({ children }: TreeBlock<StepFields>): ReactElement {
  console.log(children)
  return (
    <>
      {children.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </>
  )
}
