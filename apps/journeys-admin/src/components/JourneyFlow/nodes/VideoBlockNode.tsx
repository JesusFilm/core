import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type VideoBlockNodeData = VideoBlock

export function VideoBlockNode({
  data: block
}: NodeProps<VideoBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      title={block.video?.title?.[0]?.value ?? block.title ?? t('Video')}
      icon={<VideoOnIcon />}
    />
  )
}
