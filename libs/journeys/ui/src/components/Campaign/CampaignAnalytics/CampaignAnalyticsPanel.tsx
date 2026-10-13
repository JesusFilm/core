import { useQuery } from '@apollo/client/react'
import { keyframes } from '@emotion/react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import type { CampaignRegion } from '../types'

import type {
  GetCampaignStats,
  GetCampaignStatsVariables
} from './__generated__/GetCampaignStats'
import {
  ALL_REGIONS,
  CampaignCountryStat,
  CampaignStatsView,
  countriesForTab,
  countryName,
  formatSince,
  statsForTab
} from './campaignStatsScope'
import { GET_CAMPAIGN_STATS } from './getCampaignStats'
import { MOTION_MS, REDUCED_MOTION } from './motion'
import { WorldMap, WorldMapShapes } from './WorldMap'

const ROW_HEIGHT = 40
/** The gap between ranked rows, in px. */
const ROW_GAP = 12
const ROW_PITCH = ROW_HEIGHT + ROW_GAP

const rowEnter = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

type CampaignAnalyticsCountries = ReadonlyArray<CampaignCountryStat>

export type CampaignAnalyticsRegion = Pick<
  CampaignRegion,
  'id' | 'name' | 'listed' | 'order'
> & {
  countries?: ReadonlyArray<{ countryId: string }>
}

interface CampaignAnalyticsPanelProps {
  campaignId: string
  /** Every region of the campaign; the tabs list the listed ones. */
  regions: CampaignAnalyticsRegion[]
  /** The region a Region Page is fixed to; null on the landing page, which gets tabs. */
  fixedRegion?: CampaignAnalyticsRegion | null
  /** The campaign's interface strings; only `allRegions`, `totalVisitors` and `topCountry` are read. */
  strings: ReadonlyArray<{ key: CampaignStringKey; value: string }>
  /** The Analytics block's `showMap`: draw the world map under the tiles. */
  showMap?: boolean
  /** The projected map; the map is skipped until it is known. */
  worldMap?: WorldMapShapes | null
  /** The theme accent (`#RRGGBB`) the map shades in. */
  accentColor?: string
}

function stringValue(
  strings: CampaignAnalyticsPanelProps['strings'],
  key: CampaignStringKey,
  fallback: string
): string {
  const value = strings.find((string) => string.key === key)?.value
  return value == null || value.trim() === '' ? fallback : value
}

interface TileProps {
  testId: string
  label: string
  value: string
  caption?: string
}

function Tile({ testId, label, value, caption }: TileProps): ReactElement {
  return (
    <Stack
      data-testid={testId}
      spacing={0.5}
      sx={{
        p: 3,
        borderRadius: 1,
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)'
      }}
    >
      <Typography
        variant="overline"
        component="p"
        sx={{ color: 'var(--campaign-band-muted)', mb: 0 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        component="p"
        sx={{ color: 'var(--campaign-band-heading)' }}
      >
        {value}
      </Typography>
      {caption != null && (
        <Typography
          variant="caption"
          component="p"
          sx={{ color: 'var(--campaign-band-muted)' }}
        >
          {caption}
        </Typography>
      )}
    </Stack>
  )
}

interface RankedListProps {
  view: CampaignStatsView
  locale: string
}

/**
 * The ranked list: two columns from `md` up, read across then down (01 left,
 * 02 right, 03 left), one column below. Rows are absolutely positioned by
 * rank, so a tab switch is a CSS transition of each kept row's transform (a
 * hand FLIP: the DOM order never moves, only the translate); a row new to
 * the list fades in.
 */
function RankedList({ view, locale }: RankedListProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const numberFormat = new Intl.NumberFormat(locale)
  const count = view.countries.length
  return (
    <Stack spacing={1.5} data-testid="CampaignAnalyticsRanked">
      <Typography
        variant="overline"
        component="p"
        sx={{ color: 'var(--campaign-band-muted)' }}
      >
        {t('Top countries by views')}
      </Typography>
      <Box
        component="ol"
        data-testid="CampaignAnalyticsList"
        sx={(theme) => ({
          position: 'relative',
          listStyle: 'none',
          m: 0,
          p: 0,
          height: count * ROW_PITCH - ROW_GAP,
          [theme.breakpoints.up('md')]: {
            height: Math.ceil(count / 2) * ROW_PITCH - ROW_GAP
          }
        })}
      >
        {view.countries.map((country, rank) => {
          const column = rank % 2
          const row = Math.floor(rank / 2)
          return (
            <Box
              component="li"
              key={country.countryCode}
              data-testid={`CampaignAnalyticsRow-${country.countryCode}`}
              data-rank={rank}
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: ROW_HEIGHT,
                px: 2,
                borderRadius: 1,
                backgroundColor: 'var(--campaign-band-card)',
                display: 'grid',
                gridTemplateColumns: '1.5rem minmax(0, 1fr) auto',
                alignItems: 'center',
                columnGap: 1.5,
                transform: `translateY(${rank * ROW_PITCH}px)`,
                transition: `transform ${MOTION_MS}ms ease`,
                animation: `${rowEnter} ${MOTION_MS}ms ease`,
                ...REDUCED_MOTION,
                [theme.breakpoints.up('md')]: {
                  left: column === 1 ? '50%' : 0,
                  width: `calc(50% - ${ROW_GAP / 2}px)`,
                  transform: `translate(${column === 1 ? `${ROW_GAP / 2}px` : 0}, ${row * ROW_PITCH}px)`
                }
              })}
            >
              <Typography
                variant="caption"
                sx={{ color: 'var(--campaign-band-muted)' }}
              >
                {String(rank + 1).padStart(2, '0')}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{ color: 'var(--campaign-band-text)' }}
              >
                {countryName(country.countryCode, locale)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--campaign-band-heading)' }}
              >
                {numberFormat.format(country.visitors)}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}

function LoadingState(): ReactElement {
  return (
    <Box
      data-testid="CampaignAnalyticsSkeleton"
      aria-busy="true"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        '& .MuiSkeleton-root': { bgcolor: 'var(--campaign-band-card)' }
      }}
    >
      <Skeleton variant="rounded" height={112} />
      <Skeleton variant="rounded" height={112} />
      <Stack spacing={1.5} sx={{ gridColumn: '1 / -1' }}>
        <Skeleton variant="rounded" height={28} />
        <Skeleton variant="rounded" height={28} width="80%" />
        <Skeleton variant="rounded" height={28} width="60%" />
      </Stack>
    </Box>
  )
}

/**
 * The Analytics section's body, shared by the public page and the editor
 * canvas: it fetches `campaignStats` client-side after render, then shows the
 * visitors and top-country tiles and the ranked top countries in two
 * columns. The landing page gets region chips (ALL first) that wrap rather
 * than scroll; a Region Page is fixed to its region.
 */
export function CampaignAnalyticsPanel({
  campaignId,
  regions,
  fixedRegion = null,
  strings,
  showMap = false,
  worldMap = null,
  accentColor = '#000000'
}: CampaignAnalyticsPanelProps): ReactElement {
  const { t, i18n } = useTranslation('libs-journeys-ui')
  const locale = i18n?.language ?? 'en'
  const [selectedTab, setSelectedTab] = useState(ALL_REGIONS)
  const { data, loading } = useQuery<
    GetCampaignStats,
    GetCampaignStatsVariables
  >(GET_CAMPAIGN_STATS, { variables: { id: campaignId }, ssr: false })

  const tabRegions = [...regions]
    .filter((region) => region.listed)
    .sort((a, b) => a.order - b.order)
  const tabsShown = fixedRegion == null && tabRegions.length > 0
  const activeTab =
    fixedRegion != null
      ? fixedRegion.id
      : tabRegions.some((region) => region.id === selectedTab)
        ? selectedTab
        : ALL_REGIONS
  const activeRegion =
    fixedRegion ?? tabRegions.find((region) => region.id === activeTab)

  const chipFor = (value: string, label: string): ReactElement => {
    const selected = activeTab === value
    return (
      <ButtonBase
        key={value}
        role="tab"
        aria-selected={selected}
        onClick={() => setSelectedTab(value)}
        data-testid={`CampaignAnalyticsChip-${value}`}
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          typography: 'overline',
          lineHeight: 1.6,
          border: '1px solid',
          borderColor: selected
            ? 'var(--campaign-band-accent)'
            : 'var(--campaign-band-border)',
          backgroundColor: selected
            ? 'var(--campaign-band-accent)'
            : 'transparent',
          color: selected
            ? 'var(--campaign-band-background)'
            : 'var(--campaign-band-muted)',
          transition: `background-color ${MOTION_MS}ms ease, color ${MOTION_MS}ms ease`,
          ...REDUCED_MOTION
        }}
      >
        {label}
      </ButtonBase>
    )
  }

  // The region selector: wrapping chips on the right, ALL first, so every
  // region stays visible instead of scrolling off a tab strip.
  const tabs = tabsShown && (
    <Box
      role="tablist"
      aria-label={t('Regions')}
      data-testid="CampaignAnalyticsRegionChips"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 1
      }}
    >
      {chipFor(
        ALL_REGIONS,
        stringValue(strings, CampaignStringKey.allRegions, t('All'))
      )}
      {tabRegions.map((region) => chipFor(region.id, region.name))}
    </Box>
  )

  const mapRegions = activeRegion != null ? [activeRegion] : regions
  const highlightedCodes = mapRegions.flatMap((region) =>
    (region.countries ?? []).map((country) => country.countryId)
  )
  const mapFor = (
    visitors?: CampaignAnalyticsCountries
  ): ReactElement | null =>
    showMap && worldMap != null ? (
      <WorldMap
        shapes={worldMap}
        highlightedCodes={highlightedCodes}
        zoomToHighlighted={activeRegion != null}
        visitors={visitors}
        accentColor={accentColor}
        locale={locale}
      />
    ) : null

  if (data == null && loading)
    return (
      <Stack spacing={2}>
        {tabs}
        {mapFor()}
        <LoadingState />
      </Stack>
    )

  if (data == null)
    return (
      <Typography
        variant="body2"
        data-testid="CampaignAnalyticsUnavailable"
        sx={{ color: 'var(--campaign-band-muted)' }}
      >
        {t('Visitor numbers are temporarily unavailable')}
      </Typography>
    )

  const stats = data.campaignStats
  const view = statsForTab(stats, activeTab)
  const numberFormat = new Intl.NumberFormat(locale)
  const topCountry = view.countries[0]
  const visitorsLabel =
    activeRegion == null
      ? stringValue(
          strings,
          CampaignStringKey.totalVisitors,
          t('Total visitors')
        )
      : t('{{region}} visitors', { region: activeRegion.name })

  return (
    <Stack spacing={3} data-testid="CampaignAnalyticsStats">
      {tabs}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
        }}
      >
        <Tile
          testId="CampaignAnalyticsTopCountry"
          label={stringValue(
            strings,
            CampaignStringKey.topCountry,
            t('Top country')
          )}
          value={
            topCountry == null
              ? '—'
              : countryName(topCountry.countryCode, locale)
          }
        />
        <Tile
          testId="CampaignAnalyticsVisitors"
          label={visitorsLabel}
          value={
            view.totalVisitors === 0
              ? t('0 visitors')
              : numberFormat.format(view.totalVisitors)
          }
          caption={t('since {{date}}', {
            date: formatSince(stats.from, locale, new Date())
          })}
        />
      </Box>
      {mapFor(countriesForTab(stats, activeTab))}
      {view.totalVisitors === 0 ? (
        <Typography
          variant="body2"
          data-testid="CampaignAnalyticsEmpty"
          sx={{ color: 'var(--campaign-band-muted)' }}
        >
          {t('No visits yet')}
        </Typography>
      ) : (
        <RankedList view={view} locale={locale} />
      )}
    </Stack>
  )
}
