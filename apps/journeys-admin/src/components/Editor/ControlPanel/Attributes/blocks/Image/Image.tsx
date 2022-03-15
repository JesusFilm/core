import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import { Photo } from '@mui/icons-material'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { ImageOptions } from './Options/ImageOptions'

export function Image(block: TreeBlock<ImageBlock>): ReactElement {
  const { id } = block

  const { dispatch } = useEditor()

  const openDrawer = (): void =>
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Image',
      mobileOpen: true,
      children: <ImageOptions />
    })

  return (
    <>
      <Attribute
        id={`${id}-video-options`}
        icon={<Photo />}
        name="Image Source"
        value={block?.alt ?? ''}
        description="Image Options"
        onClick={openDrawer}
      />
    </>
  )
}
