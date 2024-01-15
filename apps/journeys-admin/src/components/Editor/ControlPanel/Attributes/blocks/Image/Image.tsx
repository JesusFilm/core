import dynamic from 'next/dynamic'
import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../../Attribute'

const ImageOptions = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Image/Options/ImageOptions" */ './Options/ImageOptions'
    ).then((mod) => mod.ImageOptions),
  { ssr: false }
)

export function Image(block: TreeBlock<ImageBlock>): ReactElement {
  const { id } = block
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

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
        icon={<Image3Icon />}
        name={t('Image Source')}
        value={block?.alt ?? ''}
        description={t('Image Options')}
        drawerTitle={t('Image')}
      >
        <ImageOptions />
      </Attribute>
    </>
  )
}
