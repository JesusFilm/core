import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3 from '@core/shared/ui/icons/Image3'

import { Attribute } from '../..'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'

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

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-image-options`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Image',
      mobileOpen: true,
      children: <ImageOptions />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-image-options`}
        icon={<Image3 />}
        name="Image Source"
        value={block?.alt ?? ''}
        description="Image Options"
        onClick={openDrawer}
      />
    </>
  )
}
