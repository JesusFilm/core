import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Type3 from '@core/shared/ui/icons/Type3'

import { Accordion } from '../../Properties/Accordion'

export function Logo(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Accordion id="logo" icon={<Type3 />} name={t('Logo')}>
      <Stack sx={{ p: 4, pt: 2 }} data-testid="Logo">
        Logo
      </Stack>
    </Accordion>
  )
}
