import { ReactElement } from 'react'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { StepFields } from './__generated__/StepFields'

interface StepProps extends TreeBlock<StepFields> {
  wrappers?: WrappersProps
}

export function Step({ children, wrappers }: StepProps): ReactElement {
  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
