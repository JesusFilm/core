import Box from '@mui/material/Box'
import { darken, lighten } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { Fragment, ReactElement, useMemo } from 'react'

import {
  countryAlpha2,
  countryNumericCode
} from '../../libs/countryNumericCode'
import { countryName } from '../campaignStatsScope'
import type { CampaignCountryStat } from '../campaignStatsScope'
import { REDUCED_MOTION } from '../motion'

import type { WorldMapCountry, WorldMapShapes } from './buildWorldMap'
import { viewportFor, viewportTransform } from './worldMapViewport'

export const WORLD_MAP_STEPS = 4

const ZOOM_MS = 600

/** The accent from darkest (fewest visitors) to lightest (most), four steps. */
const STEP_TONES: ReadonlyArray<(accent: string) => string> = [
  (accent) => darken(accent, 0.55),
  (accent) => darken(accent, 0.25),
  (accent) => accent,
  (accent) => lighten(accent, 0.35)
]

interface WorldMapProps {
  shapes: WorldMapShapes
  /** The selected tab's Region Countries (ALL: every region's), as alpha-2 codes; only these are coloured. */
  highlightedCodes: ReadonlyArray<string>
  /** Zoom to the highlighted countries instead of showing the world. */
  zoomToHighlighted: boolean
  /** The tab's visitors by Plausible alpha-2 code; undefined while loading, which draws the outline alone. */
  visitors?: ReadonlyArray<CampaignCountryStat>
  /** The theme accent, as `#RRGGBB`. */
  accentColor: string
  /** The fill of every country that is not highlighted, and of the outline. */
  neutralColor?: string
  locale: string
}

/** Which of the four steps a visitor count falls in; the highest count is the lightest. */
export function shadeStep(visitors: number, topVisitors: number): number {
  if (topVisitors <= 0 || visitors <= 0) return 0
  return Math.min(
    WORLD_MAP_STEPS - 1,
    Math.floor((visitors / topVisitors) * WORLD_MAP_STEPS)
  )
}

/**
 * The world map of the Analytics section: the shapes were projected once into
 * path strings, so this renders on the server and needs only CSS to zoom. Countries in
 * the tab's Region Countries take the accent in four steps by visitors,
 * everything else the neutral tint however many visitors it had. Plausible's
 * alpha-2 codes join the atlas ids through the numeric table, never by name,
 * so a code without a shape is simply not drawn.
 */
export function WorldMap({
  shapes,
  highlightedCodes,
  zoomToHighlighted,
  visitors,
  accentColor,
  neutralColor = 'var(--campaign-band-card)',
  locale
}: WorldMapProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const highlightedIds = useMemo(
    () =>
      new Set(
        highlightedCodes.flatMap((code) => countryNumericCode(code) ?? [])
      ),
    [highlightedCodes]
  )
  const visitorsById = useMemo(
    () =>
      new Map(
        (visitors ?? []).flatMap((stat) => {
          const id = countryNumericCode(stat.countryCode)
          return id == null ? [] : [[id, stat.visitors] as const]
        })
      ),
    [visitors]
  )
  const topVisitors = Math.max(
    0,
    ...[...highlightedIds].map((id) => visitorsById.get(id) ?? 0)
  )
  const stepColors = useMemo(
    () => STEP_TONES.map((tone) => tone(accentColor)),
    [accentColor]
  )
  const viewport = viewportFor(
    shapes,
    zoomToHighlighted ? highlightedIds : new Set<string>()
  )

  function labelOf(country: WorldMapCountry): string {
    const alpha2 = country.id == null ? undefined : countryAlpha2(country.id)
    return alpha2 == null ? country.name : countryName(alpha2, locale)
  }

  return (
    <Box
      component="svg"
      data-testid="WorldMap"
      viewBox={`0 0 ${shapes.width} ${shapes.height}`}
      role="img"
      aria-label={t('Visitors by country')}
      sx={{
        display: 'block',
        width: '100%',
        height: 'auto',
        '& path:hover': { opacity: 0.8 }
      }}
    >
      <Box
        component="g"
        data-testid="WorldMapViewport"
        style={{ transform: viewportTransform(viewport) }}
        sx={{
          transformOrigin: '0 0',
          transition: `transform ${ZOOM_MS}ms ease`,
          ...REDUCED_MOTION
        }}
      >
        {shapes.countries.map((country, index) => {
          const highlighted =
            country.id != null && highlightedIds.has(country.id)
          const count =
            country.id == null ? 0 : (visitorsById.get(country.id) ?? 0)
          const step =
            highlighted && visitors != null
              ? shadeStep(count, topVisitors)
              : null
          const key = country.id ?? `${country.name}-${index}`
          const shape = (
            <path
              d={country.d}
              data-testid={`WorldMapCountry-${country.id ?? country.name}`}
              data-step={step ?? undefined}
              style={{
                fill: step == null ? neutralColor : stepColors[step],
                stroke: 'var(--campaign-band-background)',
                strokeWidth: 0.5,
                vectorEffect: 'non-scaling-stroke'
              }}
            />
          )
          if (visitors == null) return <Fragment key={key}>{shape}</Fragment>
          return (
            <Tooltip
              key={key}
              title={
                <>
                  <Box component="span" sx={{ display: 'block' }}>
                    {labelOf(country)}
                  </Box>
                  <Box component="span" sx={{ display: 'block' }}>
                    {t('{{visitors}} visitors', {
                      visitors: numberFormat.format(count)
                    })}
                  </Box>
                </>
              }
              placement="top"
              followCursor
              enterTouchDelay={0}
            >
              {shape}
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}
