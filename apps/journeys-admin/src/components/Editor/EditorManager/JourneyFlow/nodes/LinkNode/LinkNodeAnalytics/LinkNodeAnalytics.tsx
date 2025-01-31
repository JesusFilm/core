import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionBlock } from '@core/journeys/ui/isActionBlock'
import { getTargetEventKey } from '@core/journeys/ui/plausibleHelpers/plausibleHelpers'
import Cursor4Icon from '@core/shared/ui/icons/Cursor4'

import { AnalyticsDataPoint } from '../../../AnalyticsDataPoint'

interface LinkNodeAnalyticsProps {
  actionBlock?: ActionBlock
}

export function LinkNodeAnalytics({
  actionBlock
}: LinkNodeAnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { analytics }
  } = useEditor()

  const key = getTargetEventKey(actionBlock?.action)
  const clicksCount = analytics?.targetMap.get(key)

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
        filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.25))',
        '&:hover': {
          cursor: 'default'
        }
      }}
    >
      <AnalyticsDataPoint
        value={clicksCount ?? '~'}
        Icon={Cursor4Icon}
        tooltipTitle={t('Clicks')}
      />
    </Box>
  )
}
