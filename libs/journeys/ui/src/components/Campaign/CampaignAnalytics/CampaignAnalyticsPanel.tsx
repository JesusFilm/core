import { useQuery } from '@apollo/client/react'
import { keyframes } from '@emotion/react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  KeyboardEvent,
  ReactElement,
  ReactNode,
  useId,
  useRef,
  useState
} from 'react'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { campaignStringOr } from '../CampaignProvider/campaignString'
import { campaignCardSx } from '../libs/campaignSx'
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
  statsForTab
} from './campaignStatsScope'
import { GET_CAMPAIGN_STATS } from './getCampaignStats'
import { MOTION_MS, REDUCED_MOTION } from './motion'
import { WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH, WorldMap } from './WorldMap'
import type { WorldMapState } from './WorldMap'

/** Chips and rows keep a near-square 4px corner regardless of the theme radius. */
const ROW_HEIGHT = 36
/** The gap between ranked rows, in px. */
const ROW_GAP = 6
const ROW_PITCH = ROW_HEIGHT + ROW_GAP

const NO_WORLD_MAP: WorldMapState = { shapes: null, error: null }

const rowEnter = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

type CampaignAnalyticsCountries = ReadonlyArray<CampaignCountryStat>

export type CampaignAnalyticsRegion = Pick<
  CampaignRegion,
  'id' | 'slug' | 'name' | 'listed' | 'order'
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
  /** `useWorldMap`'s answer: a box of the map's size holds its place until the shapes load; on an error the map is skipped. */
  worldMap?: WorldMapState
  /** The theme accent (`#RRGGBB`) the map shades in. */
  accentColor?: string
  /** The locale numbers, dates and country names format in: the Page Language on the public page; the UI locale when unset. */
  locale?: string
}

interface TileProps {
  testId: string
  label: string
  value: string
  caption?: string
}

function Tile({ testId, label, value, caption }: TileProps): ReactElement {
  return (
    <Stack data-testid={testId} spacing={0.5} sx={{ p: 3, ...campaignCardSx }}>
      <Typography
        variant="overline"
        component="p"
        data-testid={`${testId}Label`}
        sx={{
          color: 'var(--campaign-band-muted)',
          mb: 0,
          whiteSpace: 'pre-line'
        }}
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
  /** Two columns from `md` up (read across then down), or one beside the map. */
  columns: 1 | 2
}

/**
 * The ranked list: numbered rows as bordered cards. Rows are absolutely
 * positioned by rank, so a tab switch is a CSS transition of each kept
 * row's transform (a hand FLIP: the DOM order never moves, only the
 * translate); a row new to the list fades in.
 */
function RankedList({ view, locale, columns }: RankedListProps): ReactElement {
  const numberFormat = new Intl.NumberFormat(locale)
  const count = view.countries.length
  const twoUp = columns === 2
  return (
    <Box
      component="ol"
      data-testid="CampaignAnalyticsList"
      data-columns={columns}
      sx={(theme) => ({
        position: 'relative',
        listStyle: 'none',
        m: 0,
        p: 0,
        height: count * ROW_PITCH - ROW_GAP,
        ...(twoUp
          ? {
              [theme.breakpoints.up('md')]: {
                height: Math.ceil(count / 2) * ROW_PITCH - ROW_GAP
              }
            }
          : {})
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
              px: 1.5,
              borderRadius: '4px',
              border: '1px solid var(--campaign-band-border)',
              backgroundColor: 'var(--campaign-band-card)',
              display: 'grid',
              gridTemplateColumns: '1.75rem minmax(0, 1fr) auto',
              alignItems: 'center',
              columnGap: 1.5,
              transform: `translateY(${rank * ROW_PITCH}px)`,
              transition: `transform ${MOTION_MS}ms ease`,
              animation: `${rowEnter} ${MOTION_MS}ms ease`,
              ...REDUCED_MOTION,
              ...(twoUp
                ? {
                    [theme.breakpoints.up('md')]: {
                      left: column === 1 ? '50%' : 0,
                      width: `calc(50% - ${ROW_GAP / 2}px)`,
                      transform: `translate(${column === 1 ? `${ROW_GAP / 2}px` : 0}, ${row * ROW_PITCH}px)`
                    }
                  }
                : {})
            })}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'var(--campaign-band-muted)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {String(rank + 1).padStart(2, '0')}
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{ color: 'var(--campaign-band-text)', fontWeight: 600 }}
            >
              {countryName(country.countryCode, locale)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--campaign-band-heading)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {numberFormat.format(country.visitors)}
            </Typography>
          </Box>
        )
      })}
    </Box>
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
 * columns. The landing page gets region tabs (every region, then ALL) that
 * wrap rather than scroll and follow the WAI-ARIA tabs pattern; a Region Page
 * is fixed to its region.
 */
export function CampaignAnalyticsPanel({
  campaignId,
  regions,
  fixedRegion = null,
  strings,
  showMap = false,
  worldMap = NO_WORLD_MAP,
  accentColor = '#000000',
  locale: localeProp
}: CampaignAnalyticsPanelProps): ReactElement {
  const { t, i18n } = useTranslation('libs-journeys-ui')
  const locale = localeProp ?? i18n?.language ?? 'en'
  const theme = useTheme()
  const idPrefix = useId()
  const tabRefs = useRef(new Map<string, HTMLElement>())
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

  const tabId = (value: string): string => `${idPrefix}-tab-${value}`
  const panelId = `${idPrefix}-panel`
  const tabValues = [...tabRegions.map((region) => region.id), ALL_REGIONS]

  /** Arrow keys, Home and End move the selection and focus; Left and Right swap in a right-to-left layout. */
  function handleTabKeyDown(event: KeyboardEvent<HTMLElement>): void {
    const forwardKey = theme.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const backwardKey = theme.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    const current = tabValues.indexOf(activeTab)
    const next =
      event.key === forwardKey
        ? (current + 1) % tabValues.length
        : event.key === backwardKey
          ? (current - 1 + tabValues.length) % tabValues.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabValues.length - 1
              : null
    if (next == null) return
    event.preventDefault()
    setSelectedTab(tabValues[next])
    tabRefs.current.get(tabValues[next])?.focus()
  }

  /** A tab shows and is named by its label (a region's name); a label cut short by the ellipsis stays whole in the tooltip. */
  const tabFor = (value: string, label: string): ReactElement => {
    const selected = activeTab === value
    return (
      <ButtonBase
        key={value}
        ref={(element: HTMLElement | null) => {
          if (element == null) tabRefs.current.delete(value)
          else tabRefs.current.set(value, element)
        }}
        id={tabId(value)}
        role="tab"
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        title={label}
        onClick={() => setSelectedTab(value)}
        onKeyDown={handleTabKeyDown}
        data-testid={`CampaignAnalyticsChip-${value}`}
        sx={{
          px: 1,
          py: 0.5,
          minHeight: 30,
          borderRadius: '4px',
          typography: 'overline',
          fontSize: '0.6875rem',
          lineHeight: 1.3,
          textAlign: 'center',
          minWidth: 0,
          border: '1px solid',
          borderColor: selected
            ? 'var(--campaign-band-accent)'
            : 'var(--campaign-band-border)',
          backgroundColor: selected
            ? 'var(--campaign-band-accent)'
            : 'var(--campaign-band-card)',
          color: selected
            ? 'var(--campaign-band-background)'
            : 'var(--campaign-band-muted)',
          boxShadow: selected
            ? '0 0 0 3px color-mix(in srgb, var(--campaign-band-accent) 35%, transparent)'
            : 'none',
          transition: `background-color ${MOTION_MS}ms ease, color ${MOTION_MS}ms ease, box-shadow ${MOTION_MS}ms ease`,
          ...REDUCED_MOTION
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </Box>
      </ButtonBase>
    )
  }

  // The region selector: a grid of equal tabs, every region then ALL, so
  // every region stays visible instead of scrolling off a tab strip.
  const tabs = tabsShown && (
    <Box
      role="tablist"
      aria-label={t('Regions')}
      data-testid="CampaignAnalyticsRegionChips"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        // Each tab starts at 72px and shares the rest of the row; a region
        // name too long for its tab stays on one line, cut by an ellipsis.
        '& > *': { flex: '1 1 72px', whiteSpace: 'nowrap' }
      }}
    >
      {tabRegions.map((region) => tabFor(region.id, region.name))}
      {tabFor(
        ALL_REGIONS,
        campaignStringOr(strings, CampaignStringKey.allRegions, t('All'))
      )}
    </Box>
  )

  /**
   * The ranked list, labelled by the selected tab; it is the panel the tabs
   * control. Always mounted, so `aria-controls` never dangles: busy while
   * the stats load.
   */
  const panel = (content: ReactNode, busy: boolean): ReactElement => (
    <Box
      id={panelId}
      role={tabsShown ? 'tabpanel' : undefined}
      aria-labelledby={tabsShown ? tabId(activeTab) : undefined}
      aria-busy={busy ? 'true' : undefined}
    >
      {content}
    </Box>
  )

  const mapRegions = activeRegion != null ? [activeRegion] : regions
  const highlightedCodes = mapRegions.flatMap((region) =>
    (region.countries ?? []).map((country) => country.countryId)
  )
  const mapFor = (visitors?: CampaignAnalyticsCountries): ReactElement =>
    worldMap.shapes == null ? (
      <Box
        data-testid="WorldMapPlaceholder"
        sx={{
          width: '100%',
          aspectRatio: `${WORLD_MAP_WIDTH} / ${WORLD_MAP_HEIGHT}`
        }}
      />
    ) : (
      <WorldMap
        shapes={worldMap.shapes}
        highlightedCodes={highlightedCodes}
        zoomToHighlighted={activeRegion != null}
        visitors={visitors}
        accentColor={accentColor}
        locale={locale}
      />
    )

  const layout = showMap && worldMap.error == null ? 'map' : 'stacked'

  /**
   * One frame for the loading and loaded states, so the chips keep their
   * DOM nodes while the stats arrive. With the map: tiles and map on the
   * left, the region chips and a single column of ranks on the right
   * (stacked below `md`). Without it: chips, tiles, then the ranks in two
   * columns under their heading. Loading (no `ranks`), the map layout's
   * panel is empty and the stacked layout's holds the skeleton.
   */
  const frame = (
    top: ReactNode,
    ranks: ReactNode,
    mapVisitors?: CampaignAnalyticsCountries
  ): ReactElement => {
    const busy = ranks == null
    return (
      <Box
        data-testid="CampaignAnalyticsStats"
        data-layout={layout}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: '1px solid var(--campaign-band-border)',
          display: 'grid',
          gap: 3,
          alignItems: 'stretch',
          gridTemplateColumns:
            layout === 'map' ? { xs: '1fr', md: '3fr 2fr' } : '1fr'
        }}
      >
        {layout === 'map' ? (
          <>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {top}
              <Box
                data-testid="CampaignAnalyticsMap"
                sx={{
                  flex: 1,
                  minHeight: 240,
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  ...campaignCardSx,
                  // The map fits whatever height the ranks leave beside it.
                  '& svg': { height: '100%', maxHeight: '100%' }
                }}
              >
                {mapFor(mapVisitors)}
              </Box>
            </Stack>
            <Stack spacing={2}>
              {tabs}
              {panel(ranks, busy)}
            </Stack>
          </>
        ) : (
          <>
            {tabs}
            {busy ? panel(top, busy) : top}
            {!busy && (
              <Stack spacing={1.5}>
                <Typography
                  variant="overline"
                  component="p"
                  sx={{ color: 'var(--campaign-band-muted)' }}
                >
                  {t('Top countries by views')}
                </Typography>
                {panel(ranks, busy)}
              </Stack>
            )}
          </>
        )}
      </Box>
    )
  }

  if (data == null && loading) return frame(<LoadingState />, null)

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
      ? campaignStringOr(
          strings,
          CampaignStringKey.totalVisitors,
          t('Total visitors')
        )
      : t('{{region}} visitors', { region: activeRegion.name })

  const tiles = (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
      }}
    >
      <Tile
        testId="CampaignAnalyticsTopCountry"
        label={campaignStringOr(
          strings,
          CampaignStringKey.topCountry,
          t('Top country')
        )}
        value={
          topCountry == null ? '—' : countryName(topCountry.countryCode, locale)
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
        caption={t('all time')}
      />
    </Box>
  )
  const ranks =
    view.totalVisitors === 0 ? (
      <Typography
        variant="body2"
        data-testid="CampaignAnalyticsEmpty"
        sx={{ color: 'var(--campaign-band-muted)' }}
      >
        {t('No visits yet')}
      </Typography>
    ) : (
      <RankedList
        view={view}
        locale={locale}
        columns={layout === 'map' ? 1 : 2}
      />
    )

  return frame(tiles, ranks, countriesForTab(stats, activeTab))
}
