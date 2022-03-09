import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import { List } from '@mui/icons-material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id } = block

  const { dispatch } = useEditor()

  return (
    <>
      <Attribute
        id={`${id}-video-options`}
        icon={<List />}
        name="Options"
        value="Edit"
        description="Video Options"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Video Options',
            mobileOpen: true,
            children: <VideoOptions />
          })
        }}
      />
    </>
  )
}
