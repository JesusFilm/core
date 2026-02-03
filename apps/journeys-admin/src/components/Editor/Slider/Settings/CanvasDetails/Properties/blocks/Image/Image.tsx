import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { BlockCustomizationToggle } from '../../controls/BlockCustomizationToggle'

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
  const { journey } = useJourney()

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
        value={block?.alt ?? ''}
      >
        <>
          <ImageOptions />
          {journey?.template && <BlockCustomizationToggle />}
        </>
      </Accordion>
    </Box>
  )
}
