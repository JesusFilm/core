import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import File5Icon from '@core/shared/ui/icons/File5'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type FormBlockNodeData = TreeBlock<FormBlock>

export function FormBlockNode({
  data: block
}: NodeProps<FormBlockNodeData>): ReactElement {
  return (
    <BaseNode isTargetConnectable={false} title="Form" icon={<File5Icon />} />
  )
}
