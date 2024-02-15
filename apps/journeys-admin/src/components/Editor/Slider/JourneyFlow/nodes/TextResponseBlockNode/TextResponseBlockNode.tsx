import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface TextResponseBlockNodeData
  extends TreeBlock<TextResponseBlock> {
  step: TreeBlock<StepBlock>
}

export function TextResponseBlockNode({
  data: { step, ...block }
}: NodeProps<TextResponseBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return <ActionNode block={block} step={step} title={t('Feedback')} />
}
