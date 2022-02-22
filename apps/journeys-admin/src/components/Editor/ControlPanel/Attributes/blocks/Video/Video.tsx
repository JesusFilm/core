import { TreeBlock, useEditor } from '@core/journeys/ui'
import { ReactElement } from 'react'
import VideoLibrary from '@mui/icons-material/VideoLibrary'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { Source } from './Source'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id } = block

  const { dispatch } = useEditor()

  return (
    <>
      <Attribute
        id={`${id}-video-source`}
        icon={<VideoLibrary />}
        name="Video Source"
        description="VideoSource"
        value="tempSoure"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Video Source',
            mobileOpen: true,
            children: <Source />
          })
        }}
      />
    </>
  )
}
