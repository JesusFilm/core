import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

const ImageOptions = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Image/Options/ImageOptions" */ './Options/ImageOptions'
    ).then((mod) => mod.ImageOptions),
  { ssr: false }
)

export function Image(block: TreeBlock<ImageBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { id } = block
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-image-options`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="ImageProperties">
      <Accordion
        id={`${id}-image-options`}
        icon={<Image3Icon />}
        name={t('Image Source')}
        value={
          block?.alt === 'Default Image Icon'
            ? t('Default Image Icon')
            : ''
        }
      >
        <ImageOptions />
      </Accordion>
    </Box>
  )
}
