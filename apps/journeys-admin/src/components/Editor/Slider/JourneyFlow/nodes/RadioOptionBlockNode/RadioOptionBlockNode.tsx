import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface RadioOptionBlockNodeData extends TreeBlock<RadioOptionBlock> {
  step: TreeBlock<StepBlock>
}

export function RadioOptionBlockNode({
  data: { step, ...block }
}: NodeProps<RadioOptionBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      step={step}
      title={
        block.label != null && block.label !== '' ? block.label : t('Option')
      }
    />
  )
}
