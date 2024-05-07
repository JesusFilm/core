import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import MuiCard from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import formatISO from 'date-fns/formatISO'
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
      id: journey?.id,
      where: {
        property: 'event:page',
        period,
        date: formatISO(date, { representation: 'date' })
      }
    }
  })

  return (
    <MuiCard variant="outlined">
      <Stack spacing={2} direction="row" sx={{ p: 4, overflow: 'auto' }}>
        {data?.journeysPlausibleStatsBreakdown.map((result) => {
          const stepId = result.property.split('/')[1]
          const step = steps?.find((step) => step.id === stepId)
          return (
            <Stack spacing={2} key={stepId}>
              {step != null ? (
                <Card step={step} width={194} height={295} />
              ) : (
                <Box
                  width={194}
                  height={295}
                  sx={{
                    borderWidth: 5,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                    borderRadius: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('Deleted Card')}
                  </Typography>
                </Box>
              )}
              <Typography variant="body2">
                {t('{{count}} visitors', { count: result.visitors ?? 0 })}
              </Typography>
              <Typography variant="body2">
                {t('{{count}} views', { count: result.pageviews ?? 0 })}
              </Typography>
            </Stack>
          )
        })}
      </Stack>
    </MuiCard>
  )
}
