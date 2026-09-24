import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useMemo } from 'react'

import { CampaignFields_shareJourneys as ShareJourney } from '../../../../__generated__/CampaignFields'
import { buildAllTimeStatsFilter } from '../../../libs/buildAllTimeStatsFilter'
import { useCampaignJourneyStatsQuery } from '../../../libs/useCampaignJourneyStatsQuery'

export interface JourneyStats {
  visitors: number
  pageviews: number
}

interface CampaignJourneyStatsRowProps {
  journey: ShareJourney
  /** Reports the loaded numbers so the panel can total them. */
  onLoaded: (journeyId: string, stats: JourneyStats | null) => void
}

export function CampaignJourneyStatsRow({
  journey,
  onLoaded
}: CampaignJourneyStatsRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // Memoised so the date-stamped `where` does not change identity per render.
  const where = useMemo(() => buildAllTimeStatsFilter(), [])
  const { data, loading, error } = useCampaignJourneyStatsQuery({
    id: journey.id,
    where
  })
  const aggregate = data?.journeysPlausibleStatsAggregate
  const stats: JourneyStats | null =
    aggregate != null
      ? {
          visitors: aggregate.visitors?.value ?? 0,
          pageviews: aggregate.pageviews?.value ?? 0
        }
      : null

  useEffect(() => {
    if (loading) return
    onLoaded(journey.id, stats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.id, loading, stats?.visitors, stats?.pageviews])

  const languageName =
    journey.language.name.find(({ primary }) => primary)?.value ??
    journey.language.name[0]?.value ??
    ''

  return (
    <TableRow data-testid={`CampaignJourneyStatsRow-${journey.id}`}>
      <TableCell sx={{ maxWidth: 260 }}>
        {journey.title}
        {languageName !== '' && ` · ${languageName}`}
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton width={48} sx={{ ml: 'auto' }} />
        ) : error != null || stats == null ? (
          t('—')
        ) : (
          stats.visitors.toLocaleString()
        )}
      </TableCell>
      <TableCell align="right">
        {loading ? (
          <Skeleton width={48} sx={{ ml: 'auto' }} />
        ) : error != null || stats == null ? (
          t('—')
        ) : (
          stats.pageviews.toLocaleString()
        )}
      </TableCell>
    </TableRow>
  )
}
