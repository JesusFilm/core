import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type VideoBlockNodeData = TreeBlock<VideoBlock>

export function VideoBlockNode({
  data: block
}: NodeProps<VideoBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={block.video?.title?.[0]?.value ?? block.title ?? t('Video')}
      icon={<VideoOnIcon />}
    />
  )
}
