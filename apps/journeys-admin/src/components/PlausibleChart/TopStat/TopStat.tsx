import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GetPlausibleChart_journeysPlausibleStatsAggregate } from '../../../../__generated__/GetPlausibleChart'
import {
  durationFormatter,
  numberFormatter
} from '../../../libs/plausible/formatters'

export type SeriesKey = Omit<
  keyof GetPlausibleChart_journeysPlausibleStatsAggregate,
  '__typename'
>

function valueFormatter(seriesKey: SeriesKey, value: number): string {
  if (['visitDuration', 'timeOnPage'].includes(seriesKey as string)) {
    return durationFormatter(value)
  } else if (['bounceRate', 'conversionRate'].includes(seriesKey as string)) {
    return `${value}%`
  } else {
    return numberFormatter(value)
  }
}

interface TopStatProps {
  seriesKey: SeriesKey
  stats?: GetPlausibleChart_journeysPlausibleStatsAggregate
  selected?: boolean
  onClick?: (seriesKey: SeriesKey) => void
}

export function TopStat({
  seriesKey,
  stats,
  selected,
  onClick
}: TopStatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const title = {
    visitors: t('Unique Visitors'),
    visits: t('Total Visits'),
    pageviews: t('Total Pageviews'),
    viewsPerVisit: t('Views per visit'),
    bounceRate: t('Bounce rate'),
    visitDuration: t('Visit duration')
  }[seriesKey as string]

  return (
    <Box
      onClick={() => onClick?.(seriesKey)}
      sx={{
        cursor: 'pointer',
        '&:hover .title': {
          color: 'primary.main'
        }
      }}
    >
      <Typography
        className="title"
        variant="caption"
        sx={{
          color: selected === true ? 'primary.main' : undefined,
          borderBottomWidth: selected === true ? '1px' : 0,
          borderBottomStyle: 'solid',
          borderBottomColor: 'primary.main',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
      >
        {title}
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1 }}
        spacing={5}
      >
        <Typography variant="h5" component="span">
          {valueFormatter(
            seriesKey,
            (stats?.[seriesKey as string]?.value as number) ?? 0
          )}
        </Typography>
        <PercentageComparison
          seriesKey={seriesKey}
          change={stats?.[seriesKey as string]?.change ?? 100}
        />
      </Stack>
    </Box>
  )
}

interface PercentageComparisonProps {
  seriesKey: SeriesKey
  change: number
}

function PercentageComparison({
  seriesKey,
  change
}: PercentageComparisonProps): ReactElement {
  const formattedComparison = numberFormatter(Math.abs(change))

  if (change > 0) {
    const color = seriesKey === 'bounceRate' ? 'error.main' : 'success.main'
    return (
      <Stack direction="row" spacing={1}>
        <Typography sx={{ color, fontWeight: 'bold' }} fontSize="0.8rem">
          &uarr;
        </Typography>
        <Typography fontSize="0.8rem">{formattedComparison}%</Typography>
      </Stack>
    )
  } else if (change < 0) {
    const color = seriesKey === 'BounceRate' ? 'success.main' : 'error.main'
    return (
      <Stack direction="row" spacing={1}>
        <Typography sx={{ color, fontWeight: 'bold' }} fontSize="0.8rem">
          &darr;
        </Typography>
        <Typography fontSize="0.8rem">{formattedComparison}%</Typography>
      </Stack>
    )
  } else if (change === 0) {
    // eslint-disable-next-line i18next/no-literal-string
    return <Typography fontSize="0.8rem">&#12336; 0%</Typography>
  } else {
    return <></>
  }
}
