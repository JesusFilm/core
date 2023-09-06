import VideoLibrary from '@mui/icons-material/VideoLibrary' // icon-replace: no icon serves similar purpose
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Link from '@core/shared/ui/icons/Link'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'

import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, videoId } = block

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

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-video-options`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Video',
      children: <VideoOptions />
    })
  }, [id, videoId, dispatch])

  return (
    <>
      <Attribute
        id={`${id}-video-action`}
        icon={<Link />}
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
        value={block.video?.title?.[0]?.value ?? block.title ?? ''}
        description="Video Options"
        onClick={openDrawer}
      />
    </>
  )
}
