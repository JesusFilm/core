import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { VideoBlockEditor } from '../../../../../../Drawer/VideoBlockEditor'

interface BackgroundMediaVideoProps {
  cardBlock?: TreeBlock<CardBlock>
}

export function BackgroundMediaVideo({
  cardBlock
}: BackgroundMediaVideoProps): ReactElement {
  const coverBlock = cardBlock?.children.find(
    (child) => child.id === cardBlock?.coverBlockId
  ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock> | undefined

  return (
    <VideoBlockEditor
      selectedBlock={
        coverBlock?.__typename === 'VideoBlock' ? coverBlock : null
      }
      onChange={handleChange}
    />
  )
}
