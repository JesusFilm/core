import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

export function ScanCount(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        color: 'secondary.light'
      }}
    >
      <BarChartSquare3Icon />
      <Typography variant="subtitle3">
        {t('{{count}} scans', {
          count: 0
        })}
      </Typography>
    </Stack>
  )
}
