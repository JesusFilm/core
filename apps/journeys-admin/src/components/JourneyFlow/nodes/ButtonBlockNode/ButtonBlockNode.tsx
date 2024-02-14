import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface ButtonBlockNodeData extends TreeBlock<ButtonBlock> {
  step: TreeBlock<StepBlock>
}

export function ButtonBlockNode({
  data: { step, ...block }
}: NodeProps<ButtonBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      step={step}
      title={
        block.label != null && block.label !== '' ? block.label : t('Button')
      }
    />
  )
}
