import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Type3 from '@core/shared/ui/icons/Type3'

import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { ImageSource } from '../../../Drawer/ImageSource'
import { Accordion } from '../../Properties/Accordion'

export function Logo(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const selectedBlock = journey?.logoImageBlock
  function updateImageBlock(input: ImageBlockUpdateInput): void {}
  async function deleteImageBlock(): Promise<void> {}

  return (
    <Accordion id="logo" icon={<Type3 />} name={t('Logo')}>
      <Stack sx={{ p: 4, pt: 2 }} data-testid="Logo">
        <ImageSource
          selectedBlock={selectedBlock}
          onChange={async (input) => updateImageBlock(input)}
          onDelete={deleteImageBlock}
        />
      </Stack>
    </Accordion>
  )
}
