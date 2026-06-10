import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useEffect } from 'react'

import Data1Icon from '@core/shared/ui/icons/Data1'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import { IdType } from '../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { localizeAndRound } from '../../JourneyList/JourneyCard/TemplateAggregateAnalytics/localizeAndRound'

export interface TemplateRowMetricsProps {
  journeyId: string
}

/**
 * Compact three-metric strip — Template uses / Views / Responses — for the
 * mobile gallery row. The same three metrics the desktop JourneyCard shows
 * via TemplateAggregateAnalytics, rendered as icon + number pairs sized to sit
 * inline on a list row.
 *
 * Each row mounts its own lazy query, matching the desktop JourneyCard so the
 * analytics surface stays consistent across the two layouts.
 */
export function TemplateRowMetrics({
  journeyId
}: TemplateRowMetricsProps): ReactElement {
  const { i18n, t } = useTranslation('apps-journeys-admin')
  const locale = i18n?.language ?? 'en'
  const { query } = useTemplateFamilyStatsAggregateLazyQuery()
  const [getTemplateStats, { data, loading, error }] = query

  useEffect(() => {
    if (journeyId !== '') {
      void getTemplateStats({
        variables: { id: journeyId, idType: IdType.databaseId, where: {} }
      })
    }
  }, [journeyId, getTemplateStats])

  const stats = data?.templateFamilyStatsAggregate
  // Keep the skeleton up while loading, but drop it on error too — otherwise a
  // failed request leaves the skeleton spinning forever (it never gets `data`).
  const showSkeleton = loading || (data == null && error == null)

  const metrics: Array<{
    key: string
    icon: ReactNode
    label: string
    value?: number
  }> = [
    {
      key: 'uses',
      icon: <Data1Icon sx={{ fontSize: 16, color: 'text.secondary' }} />,
      label: t('Template uses'),
      value: stats?.childJourneysCount
    },
    {
      key: 'views',
      icon: <EyeOpenIcon sx={{ fontSize: 16, color: 'text.secondary' }} />,
      label: t('Views'),
      value: stats?.totalJourneysViews
    },
    {
      key: 'responses',
      icon: <Inbox2Icon sx={{ fontSize: 16, color: 'text.secondary' }} />,
      label: t('Responses'),
      value: stats?.totalJourneysResponses
    }
  ]

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2.5}
      sx={{ flexShrink: 0 }}
    >
      {metrics.map(({ key, icon, label, value }) => (
        <Stack
          key={key}
          direction="row"
          alignItems="center"
          spacing={0.5}
          aria-label={label}
        >
          {icon}
          {showSkeleton ? (
            <Skeleton variant="text" width={16} height={16} />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {localizeAndRound(value, locale) ?? '–'}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  )
}
