import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../__generated__/BlockFields'
import { ActionNode } from '../ActionNode'

export interface VideoBlockNodeData extends TreeBlock<VideoBlock> {
  step: TreeBlock<StepBlock>
}

export function VideoBlockNode({
  data: { step, ...block }
}: NodeProps<VideoBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      step={step}
      title={block.video?.title?.[0]?.value ?? block.title ?? t('Video')}
    />
  )
}
