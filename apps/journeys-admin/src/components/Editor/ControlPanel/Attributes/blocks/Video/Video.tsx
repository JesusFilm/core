import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import { VideoLibrary } from '@mui/icons-material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id } = block

  const { dispatch } = useEditor()

  const openDrawer = (): void =>
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Video',
      mobileOpen: true,
      children: <VideoOptions />
    })

  return (
    <Attribute
      id={`${id}-video-options`}
      icon={<VideoLibrary />}
      name="Video Source"
      value={block?.title ?? ''}
      description="Video Options"
      onClick={openDrawer}
    />
  )
}
