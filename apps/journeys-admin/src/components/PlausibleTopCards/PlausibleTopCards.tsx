import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import MuiCard from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import formatISO from 'date-fns/formatISO'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import {
  GetPlausibleTopCards,
  GetPlausibleTopCardsVariables
} from '../../../__generated__/GetPlausibleTopCards'
import { StepFields } from '../../../__generated__/StepFields'
import { usePlausibleLocal } from '../PlausibleLocalProvider'

import { Card } from './Card'

const GET_PLAUSIBLE_TOP_CARDS = gql`
  query GetPlausibleTopCards($where: PlausibleStatsBreakdownFilter!, $id: ID!) {
    journeysPlausibleStatsBreakdown(
      where: $where
      id: $id
      idType: databaseId
    ) {
      property
      visitors
      pageviews
    }
  }
`

export function PlausibleTopCards(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepFields>>)
      : undefined
  const {
    state: { period, date }
  } = usePlausibleLocal()
  const { data } = useQuery<
    GetPlausibleTopCards,
    GetPlausibleTopCardsVariables
  >(GET_PLAUSIBLE_TOP_CARDS, {
    variables: {
      id: journey?.id as string,
      where: {
        property: 'event:page',
        period,
        date: formatISO(date, { representation: 'date' })
      }
    },
    skip: journey == null
  })

  const results =
    data?.journeysPlausibleStatsBreakdown.filter(
      ({ property }) => property.split('/')[1] != null
    ) ?? []

  return (
    <MuiCard variant="outlined">
      <Stack spacing={2} direction="row" sx={{ p: 4, overflow: 'auto' }}>
        {compact(
          results.map((result) => {
            const stepId = result.property.split('/')[1]
            const step = steps?.find((step) => step.id === stepId)

            if (step == null) return null

            return (
              <Stack spacing={2} key={stepId}>
                <Card step={step} width={194} height={295} />
                <Typography variant="body2">
                  {t('{{count}} visitors', { count: result.visitors ?? 0 })}
                </Typography>
                <Typography variant="body2">
                  {t('{{count}} views', { count: result.pageviews ?? 0 })}
                </Typography>
              </Stack>
            )
          })
        )}
      </Stack>
    </MuiCard>
  )
}
