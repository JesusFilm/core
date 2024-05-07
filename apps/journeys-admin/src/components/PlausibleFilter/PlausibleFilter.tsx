import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
    <Card variant="outlined">
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2
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
      </CardContent>
    </Card>
  )
}
