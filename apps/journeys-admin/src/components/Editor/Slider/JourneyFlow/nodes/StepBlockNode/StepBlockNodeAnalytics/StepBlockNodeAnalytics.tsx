import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Clock1 from '@core/shared/ui/icons/Clock1'
import TrendDown1 from '@core/shared/ui/icons/TrendDown1'
import UserProfile3 from '@core/shared/ui/icons/UserProfile3'

import { AnalyticsDataPoint } from '../../../AnalyticsDataPoint'

const StatsOverlay = styled(Stack)(({ theme }) => ({
  width: '100%',
  alignItems: 'center',
  position: 'absolute',
  top: -8,
  transform: 'translateY(-100%)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
  '&:before': {
    content: "''",
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, 50%)',
    bottom: 0,
    'border-top': `12px solid ${theme.palette.background.paper}`,
    'border-left': '12px solid transparent',
    'border-right': '12px solid transparent'
  },
  filter:
    'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.2)) drop-shadow(0 3px 4px rgba(0, 0, 0, 0.14)) drop-shadow(0 1px 8px rgba(0, 0, 0, .12))'
}))

function formatTime(totalSeconds: number): string {
  const roundedTotal = Math.round(totalSeconds + Number.EPSILON)
  const minutes = Math.round(roundedTotal / 60 + Number.EPSILON)
  const seconds = roundedTotal % 60

  return minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`
}

interface StepBlockNodeAnalyticsProps {
  timeOnPage?: number
  visitors?: number
  visitorsExitAtStep?: number
}

export function StepBlockNodeAnalytics({
  timeOnPage = 0,
  visitors = 0,
  visitorsExitAtStep = 0
}: StepBlockNodeAnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <StatsOverlay direction="row" data-testid="StepBlockNodeAnalytics">
      <AnalyticsDataPoint
        Icon={UserProfile3}
        tooltipLabel={t('Unique visitors')}
      >
        {visitors}
      </AnalyticsDataPoint>
      <Divider orientation="vertical" flexItem />
      <AnalyticsDataPoint Icon={TrendDown1} tooltipLabel={t('Bounce rate')}>
        {`${visitorsExitAtStep}%`}
      </AnalyticsDataPoint>
      <Divider orientation="vertical" flexItem />
      <AnalyticsDataPoint Icon={Clock1} tooltipLabel={t('Visit duration')}>
        {formatTime(timeOnPage)}
      </AnalyticsDataPoint>
    </StatsOverlay>
  )
}
