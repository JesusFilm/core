import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { GetCampaignCountryStats_campaign_countryStats as CountryStats } from '../../../../__generated__/GetCampaignCountryStats'
import { useCampaignCountryStatsQuery } from '../../../libs/useCampaignCountryStatsQuery'
import { SECTION_HEADER } from '../CampaignSettingsForm'

import {
  CampaignJourneyStatsRow,
  JourneyStats
} from './CampaignJourneyStatsRow'

interface CampaignAnalyticsPanelProps {
  campaign: Campaign
  /** Lifted so the preview pane can show the same country numbers. */
  onCountryStats?: (stats: CountryStats | null) => void
}

const TOP_COUNTRIES = 5

/**
 * Per-journey visitors/pageviews for the SAVED share journeys (unsaved picks
 * have no public traffic yet) plus the campaign-wide country breakdown.
 */
export function CampaignAnalyticsPanel({
  campaign,
  onCountryStats
}: CampaignAnalyticsPanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [rows, setRows] = useState<Record<string, JourneyStats | null>>({})
  const {
    data,
    loading: countryLoading,
    error: countryError,
    refetch
  } = useCampaignCountryStatsQuery({ id: campaign.id })
  const countryStats = data?.campaign?.countryStats ?? null

  const handleLoaded = useCallback(
    (journeyId: string, stats: JourneyStats | null) => {
      setRows((previous) =>
        previous[journeyId]?.visitors === stats?.visitors &&
        previous[journeyId]?.pageviews === stats?.pageviews &&
        journeyId in previous
          ? previous
          : { ...previous, [journeyId]: stats }
      )
    },
    []
  )

  // Surface the country stats to the parent (preview pane) whenever they change.
  useEffect(() => {
    onCountryStats?.(countryStats)
  }, [countryStats, onCountryStats])

  const loaded = Object.values(rows).filter(
    (stats): stats is JourneyStats => stats != null
  )
  const totalVisitors = loaded.reduce((sum, stats) => sum + stats.visitors, 0)
  const totalPageviews = loaded.reduce((sum, stats) => sum + stats.pageviews, 0)
  const journeys = campaign.shareJourneys

  return (
    <Stack spacing={3} data-testid="CampaignAnalyticsPanel">
      <Stack spacing={1}>
        <Typography sx={SECTION_HEADER}>{t('Journey analytics')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('All-time numbers for the share journeys saved on this campaign.')}
        </Typography>
      </Stack>
      {journeys.length === 0 ? (
        <Alert severity="info">
          {t('Save some share journeys to see their analytics here.')}
        </Alert>
      ) : (
        <Table size="small" data-testid="CampaignJourneyStatsTable">
          <TableHead>
            <TableRow>
              <TableCell>{t('Journey')}</TableCell>
              <TableCell align="right">{t('Visitors')}</TableCell>
              <TableCell align="right">{t('Views')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {journeys.map((journey) => (
              <CampaignJourneyStatsRow
                key={journey.id}
                journey={journey}
                onLoaded={handleLoaded}
              />
            ))}
            <TableRow data-testid="CampaignJourneyStatsTotals">
              <TableCell sx={{ fontWeight: 700 }}>{t('Total')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {totalVisitors.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {totalPageviews.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}

      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography sx={SECTION_HEADER}>{t('Country views')}</Typography>
          <Button
            size="small"
            onClick={() => void refetch()}
            disabled={countryLoading}
          >
            {t('Refresh')}
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t(
            'What the public page shows: views of the published share journeys, by country.'
          )}
        </Typography>
      </Stack>
      {countryLoading && countryStats == null ? (
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      ) : countryStats == null ? (
        <Alert severity={countryError != null ? 'warning' : 'info'}>
          {countryError != null
            ? t("Couldn't load country views right now.")
            : t('No country views yet.')}
        </Alert>
      ) : (
        <Table size="small" data-testid="CampaignCountryStatsTable">
          <TableHead>
            <TableRow>
              <TableCell>{t('Country')}</TableCell>
              <TableCell align="right">{t('Visitors')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {countryStats.countries.slice(0, TOP_COUNTRIES).map((country) => (
              <TableRow key={country.countryCode}>
                <TableCell>
                  {country.countryName ?? country.countryCode}
                </TableCell>
                <TableCell align="right">
                  {country.visitors.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('Total')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {countryStats.totalVisitors.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </Stack>
  )
}
