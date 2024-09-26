import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import {
  GetJourneyVisitorsCountWithTextResponses,
  GetJourneyVisitorsCountWithTextResponsesVariables
} from '../../../../../../__generated__/GetJourneyVisitorsCountWithTextResponses'
import { Item } from '../Item'

export const GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES = gql`
  query GetJourneyVisitorsCountWithTextResponses(
    $filter: JourneyVisitorFilter!
  ) {
    journeyVisitorCount(filter: $filter)
  }
`

export function ResponsesItem(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [loadVisitorsResponseCount, { data }] = useLazyQuery<
    GetJourneyVisitorsCountWithTextResponses,
    GetJourneyVisitorsCountWithTextResponsesVariables
  >(GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES)

  useEffect(() => {
    if (journey?.id != null)
      void loadVisitorsResponseCount({
        variables: {
          filter: { journeyId: journey.id, hasTextResponse: true }
        }
      })
  }, [journey?.id, loadVisitorsResponseCount, data])

  return (
    <Stack direction="row" alignItems="center" data-testid="ResponsesItem">
      <NextLink
        href={`/journeys/${journey?.id}/reports/visitors?withSubmittedText=true`}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <Item
          variant="icon-button"
          label={t('Responses')}
          icon={<Inbox2Icon />}
        />
      </NextLink>
      <Typography variant="body2">{data?.journeyVisitorCount ?? ''}</Typography>
    </Stack>
  )
}
