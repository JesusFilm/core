import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
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
  cursor: 'default',
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

function getPercentage(dividend, divisor): string {
  let quotient = dividend / divisor

  if (Number.isNaN(quotient) || !Number.isFinite(quotient)) {
    quotient = 0
  }

  return quotient.toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 0
  })
}

interface StepBlockNodeAnalyticsProps {
  stepId: string
}

export function StepBlockNodeAnalytics({
  stepId
}: StepBlockNodeAnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { plausibleThreshold } = useFlags()
  const {
    state: { analytics }
  } = useEditor()
  const stepStats = analytics?.stepsStats.find((step) => step.stepId === stepId)
  const visitors = stepStats?.visitors ?? 0
  const visitorsExitAtStep = stepStats?.visitorsExitAtStep ?? 0
  const timeOnPage = stepStats?.timeOnPage ?? 0

  const totalVisitors = analytics?.totalVisitors ?? 0
  const VISITOR_THRESHOLD = plausibleThreshold ? 1 : 10
  const hideStats = totalVisitors < VISITOR_THRESHOLD

  return (
    <StatsOverlay
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      data-testid="StepBlockNodeAnalytics"
    >
      <AnalyticsDataPoint
        Icon={UserProfile3}
        tooltipTitle={t('Unique visitors')}
        value={visitors}
      />
      <AnalyticsDataPoint
        Icon={TrendDown1}
        tooltipTitle={
          hideStats
            ? t('Exit Rate: Needs more data')
            : t('Approximate Exit rate')
        }
        value={hideStats ? '~' : getPercentage(visitorsExitAtStep, visitors)}
      />
      <AnalyticsDataPoint
        Icon={Clock1}
        tooltipTitle={
          hideStats
            ? t('Visit Duration: Needs more data')
            : t('Approximate Visit duration')
        }
        value={hideStats ? '~' : formatTime(timeOnPage)}
      />
    </StatsOverlay>
  )
}
