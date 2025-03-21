import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Menu1 from '@core/shared/ui/icons/Menu1'

import { Accordion } from '../../Properties/Accordion'

import { MenuActionButton } from './MenuActionButton'
import { MenuIconSelect } from './MenuIconSelect'

export function Menu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Accordion id="menu" icon={<Menu1 />} name={t('Menu')}>
      <Stack sx={{ p: 4, pt: 2 }} spacing={4} data-testid="Menu">
        <MenuIconSelect />
        <MenuActionButton />
      </Stack>
    </Accordion>
  )
}
