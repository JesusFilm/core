import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_FormBlock as FormBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface FormBlockNodeData extends TreeBlock<FormBlock> {
  step: TreeBlock<StepBlock>
}

export function FormBlockNode({
  data: { step, ...block }
}: NodeProps<FormBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return <ActionNode block={block} step={step} title={t('Form')} />
}
