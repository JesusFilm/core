import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import VideoLibrary from '@mui/icons-material/VideoLibrary'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'
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

  const selectedAction = actions.find(
    (act) => act.value === block.action?.__typename
  )

  console.log(selectedAction)

  return (
    <>
      <Attribute
        id={`${id}-video-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={selectedAction?.label ?? 'None'}
        description="Action"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Action',
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-video-options`}
        icon={<VideoLibrary />}
        name="Video Source"
        value={block?.video?.variant?.hls ?? ''}
        description="Video Options"
        onClick={openDrawer}
      />
    </>
  )
}
