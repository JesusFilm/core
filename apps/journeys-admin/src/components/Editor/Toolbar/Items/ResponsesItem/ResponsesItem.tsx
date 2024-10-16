import { gql, useLazyQuery } from '@apollo/client'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useEffect } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import {
  GetJourneyVisitorsCountWithTextResponses,
  GetJourneyVisitorsCountWithTextResponsesVariables
} from '../../../../../../__generated__/GetJourneyVisitorsCountWithTextResponses'
import { Item } from '../Item'

interface ResponseItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export const GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES = gql`
  query GetJourneyVisitorsCountWithTextResponses(
    $filter: JourneyVisitorFilter!
  ) {
    journeyVisitorCount(filter: $filter)
  }
`

export function ResponsesItem({ variant }: ResponseItemProps): ReactElement {
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
    <NextLink
      href={`/journeys/${journey?.id}/reports/visitors?withSubmittedText=true`}
      passHref
      legacyBehavior
      prefetch={false}
    >
      <Item
        variant={variant}
        label={t('Responses')}
        icon={<Inbox2Icon />}
        count={data?.journeyVisitorCount ?? 0}
        countLabel={t('{{count}} responses', {
          count: data?.journeyVisitorCount ?? 0
        })}
      />
    </NextLink>
  )
}
