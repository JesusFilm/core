import { ReactElement } from 'react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { BlockRenderer } from '../../BlockRenderer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'

export function Step({ children }: TreeBlock<StepBlock>): ReactElement {
  return (
    <>
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </>
  )
}
