import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlausibleLocal } from '../PlausibleLocalProvider'

import { Arrows } from './Arrows'
import { Comparison } from './Comparison'
import { Period } from './Period'

export function PlausibleFilter(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { period, comparison }
  } = usePlausibleLocal()

  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        alignItems: 'center'
      }}
    >
      {['day', 'month', 'year'].includes(period) && <Arrows />}
      <Period />
      {comparison != null && (
        <>
          <Typography>{t('vs.')}</Typography>
          <Comparison />
        </>
      )}
    </Stack>
  )
}
