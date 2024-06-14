import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import PointerClick from '@core/shared/ui/icons/PointerClick'

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
        'border-radius': 20,
        backgroundColor: 'background.paper',
        position: 'absolute',
        right: 0,
        top: 0,
        transform: 'translate(50%, -50%)',
        filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.25))'
      }}
    >
      <AnalyticsDataPoint Icon={PointerClick} tooltipLabel={t('Clicks')}>
        {props.children ?? '~'}
      </AnalyticsDataPoint>
    </Box>
  )
}
