import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import capitalize from 'lodash/capitalize'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, color } = block

  const { dispatch } = useEditor()

  return (
    <>
      <Attribute
        id={`${id}-video-options`}
        icon={<ColorDisplayIcon color={color} />}
        name="Options"
        value={capitalize(color?.toString() ?? 'primary')}
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
