import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface SignUpBlockNodeData extends TreeBlock<SignUpBlock> {
  step: TreeBlock<StepBlock>
}

export function SignUpBlockNode({
  data: { step, ...block }
}: NodeProps<SignUpBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return <ActionNode block={block} step={step} title={t('Subscribe')} />
}
