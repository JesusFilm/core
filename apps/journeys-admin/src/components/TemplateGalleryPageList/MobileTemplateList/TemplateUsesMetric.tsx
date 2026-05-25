import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect } from 'react'

import Data1Icon from '@core/shared/ui/icons/Data1'

import { IdType } from '../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { localizeAndRound } from '../../JourneyList/JourneyCard/TemplateAggregateAnalytics/localizeAndRound'

export interface TemplateUsesMetricProps {
  journeyId: string
}

/**
 * Compact single-metric variant of TemplateAggregateAnalytics — renders
 * just the "Template uses" count (icon + number) for use inside a list
 * row where the full three-metric strip won't fit.
 *
 * Each row mounts its own query, matching the existing pattern on the
 * desktop JourneyCard so the analytics surface stays consistent across
 * the two layouts.
 */
export function TemplateUsesMetric({
  journeyId
}: TemplateUsesMetricProps): ReactElement {
  const { i18n, t } = useTranslation('apps-journeys-admin')
  const locale = i18n?.language ?? 'en'
  const { query } = useTemplateFamilyStatsAggregateLazyQuery()
  const [getTemplateStats, { data, loading }] = query

  useEffect(() => {
    if (journeyId !== '') {
      void getTemplateStats({
        variables: { id: journeyId, idType: IdType.databaseId, where: {} }
      })
    }
  }, [journeyId, getTemplateStats])

  const childJourneys = data?.templateFamilyStatsAggregate?.childJourneysCount
  const showSkeleton = loading || data == null

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      aria-label={t('Template uses')}
    >
      <Data1Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
      {showSkeleton ? (
        <Skeleton variant="text" width={20} height={16} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          {localizeAndRound(childJourneys, locale)}
        </Typography>
      )}
    </Stack>
  )
}
