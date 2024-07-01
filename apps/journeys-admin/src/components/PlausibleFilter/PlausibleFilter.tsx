import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlausibleLocal } from '../PlausibleLocalProvider'

import { Arrows } from './Arrows'
import { Comparison } from './Comparison'
import { Period } from './Period'

export enum FilterType {
  Flow = 'flow',
  Dashboard = 'dashboard'
}

interface PlausibleProps {
  filterType: FilterType
}

export function PlausibleFilter({ filterType }: PlausibleProps): ReactElement {
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
      <Period filterType={filterType} />
      {comparison != null && filterType === 'dashboard' && (
        <>
          <Typography>{t('vs.')}</Typography>
          <Comparison />
        </>
      )}
    </Stack>
  )
}
