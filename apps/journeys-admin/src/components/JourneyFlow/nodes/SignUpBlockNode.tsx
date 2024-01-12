import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type SignUpBlockNodeData = TreeBlock<SignUpBlock>

export function SignUpBlockNode({
  data: block
}: NodeProps<SignUpBlockNodeData>): ReactElement {
  return (
    <BaseNode
      isTargetConnectable={false}
      title="Sign Up"
      icon={<Mail2Icon />}
    />
  )
}
