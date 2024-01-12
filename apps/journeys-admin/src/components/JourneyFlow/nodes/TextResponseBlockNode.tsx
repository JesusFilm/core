import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type TextResponseBlockNodeData = TreeBlock<TextResponseBlock>

export function TextResponseBlockNode({
  data: block
}: NodeProps<TextResponseBlockNodeData>): ReactElement {
  return (
    <BaseNode
      isTargetConnectable={false}
      title={block.label}
      icon={<TextInput1Icon />}
    />
  )
}
