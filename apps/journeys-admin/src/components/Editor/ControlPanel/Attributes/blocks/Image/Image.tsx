import { ReactElement, useEffect } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Photo from '@mui/icons-material/Photo'
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
      children: <ImageOptions />
    })

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-image-options`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Image',
      children: <ImageOptions />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-image-options`}
        icon={<Photo />}
        name="Image Source"
        value={block?.alt ?? ''}
        description="Image Options"
        onClick={openDrawer}
      />
    </>
  )
}
