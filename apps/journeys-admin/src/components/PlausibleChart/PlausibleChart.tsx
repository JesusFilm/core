import { gql, useQuery } from '@apollo/client'
import MuiCard from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { LineChart, lineElementClasses } from '@mui/x-charts'
import formatISO from 'date-fns/formatISO'
import reduce from 'lodash/reduce'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetPlausibleChart,
  GetPlausibleChartVariables,
  GetPlausibleChart_journeysPlausibleStatsAggregate
} from '../../../__generated__/GetPlausibleChart'
import { formatDay } from '../../libs/plausible/formatters'
import { usePlausibleLocal } from '../PlausibleLocalProvider'

import { TopStat } from './TopStat'

const GET_PLAUSIBLE_TOP_CARDS = gql`
  query GetPlausibleChart(
    $whereTimeseries: PlausibleStatsTimeseriesFilter!
    $whereAggregate: PlausibleStatsAggregateFilter!
    $id: ID!
  ) {
    journeysPlausibleStatsTimeseries(
      where: $whereTimeseries
      id: $id
      idType: databaseId
    ) {
      bounceRate
      visits
      visitors
      visitDuration
      viewsPerVisit
      pageviews
      property
    }
    journeysPlausibleStatsAggregate(
      where: $whereAggregate
      id: $id
      idType: databaseId
    ) {
      visitors {
        value
        change
      }
      visits {
        value
        change
      }
      pageviews {
        change
        value
      }
      viewsPerVisit {
        change
        value
      }
      bounceRate {
        value
        change
      }
      visitDuration {
        change
        value
      }
    }
  }
`

export function PlausibleChart(): ReactElement {
  const theme = useTheme()
  const { journey } = useJourney()
  const {
    state: { period, date }
  } = usePlausibleLocal()
  const [seriesKey, setSeriesKey] =
    useState<
      Omit<
        keyof GetPlausibleChart_journeysPlausibleStatsAggregate,
        '__typename'
      >
    >('visitors')
  const { data } = useQuery<GetPlausibleChart, GetPlausibleChartVariables>(
    GET_PLAUSIBLE_TOP_CARDS,
    {
      variables: {
        id: journey?.id as string,
        whereTimeseries: {
          period,
          date: formatISO(date, { representation: 'date' })
        },
        whereAggregate: {
          period,
          date: formatISO(date, { representation: 'date' })
        }
      },
      skip: journey == null
    }
  )

  const dataset =
    data?.journeysPlausibleStatsTimeseries != null
      ? data.journeysPlausibleStatsTimeseries
      : []

  return (
    <MuiCard variant="outlined">
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={5}
        sx={{ pt: 5, px: 5 }}
      >
        {reduce(
          data?.journeysPlausibleStatsAggregate,
          (result, value, key) => {
            if (value == null || value === 'PlausibleStatsAggregateResponse')
              return result

            result.push(
              <TopStat
                key={key}
                seriesKey={key}
                stats={data?.journeysPlausibleStatsAggregate}
                selected={seriesKey === key}
                onClick={setSeriesKey}
              />
            )
            return result
          },
          [] as ReactElement[]
        )}
      </Stack>
      <LineChart
        sx={{
          [`& .${lineElementClasses.root}`]: {
            strokeWidth: 4
          },
          '& .MuiAreaElement-series-main': {
            fill: "url('#mainGradient')"
          },
          '& .MuiMarkElement-series-main': {
            opacity: 0,
            '&.MuiMarkElement-highlighted': {
              opacity: 1
            }
          }
        }}
        grid={{ horizontal: true }}
        height={400}
        series={[
          {
            id: 'main',
            curve: 'linear',
            dataKey: seriesKey as string,
            area: true,
            color: theme.palette.primary.main
          }
        ]}
        xAxis={[
          {
            scaleType: 'point',
            dataKey: 'property',
            valueFormatter: (value) => formatDay(new Date(value as string))
          }
        ]}
        dataset={dataset}
        yAxis={[
          {
            tickMinStep: 1,
            tickLabelStyle: { transform: 'translateX(-10px)' }
          }
        ]}
        leftAxis={{ disableTicks: true, disableLine: true }}
        bottomAxis={{
          disableTicks: true,
          tickLabelStyle: { transform: 'translateY(10px)' }
        }}
      >
        <defs>
          <linearGradient id="mainGradient" gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={theme.palette.primary.main}
              stopOpacity={0.5}
            />
            <stop
              offset="100%"
              stopColor={theme.palette.primary.main}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
      </LineChart>
    </MuiCard>
  )
}
