import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Cursor4 from '@core/shared/ui/icons/Cursor4'
import { AnalyticsDataPoint } from '../../../AnalyticsDataPoint'

interface LinkNodeAnalyticsProps {
  children?: number
}

export function LinkNodeAnalytics(props: LinkNodeAnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      data-testid="LinkNodeAnalytics"
      sx={{
        borderRadius: 20,
        backgroundColor: 'background.paper',
        position: 'absolute',
        right: 0,
        top: 0,
        transform: 'translate(50%, -50%)',
        boxShadow: 3
      }}
    >
      <AnalyticsDataPoint Icon={Cursor4} tooltipLabel={t('Clicks')}>
        {props.children ?? '~'}
      </AnalyticsDataPoint>
    </Box>
  )
}
