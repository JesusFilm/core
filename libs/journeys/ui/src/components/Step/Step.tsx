import { ReactElement } from 'react'
import { TreeBlock } from '../..'
import { BlockRenderer } from '../BlockRenderer'
import { StepFields } from './__generated__/StepFields'

export function Step({ children }: TreeBlock<StepFields>): ReactElement {
  return (
    <>
      {children.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </>
  )
}
