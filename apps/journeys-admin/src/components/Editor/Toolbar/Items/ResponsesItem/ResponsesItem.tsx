import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useEffect } from 'react'

import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import {
  GetJourneyVisitorsCountWithTextResponses,
  GetJourneyVisitorsCountWithTextResponsesVariables
} from '../../../../../../__generated__/GetJourneyVisitorsCountWithTextResponses'
import { Item } from '../Item'

interface ResponseItemProps {
  variant: ComponentProps<typeof Item>['variant']
  fromJourneyList?: boolean
  journeyId?: string
}

export const GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES = gql`
  query GetJourneyVisitorsCountWithTextResponses(
    $filter: JourneyVisitorFilter!
  ) {
    journeyVisitorCount(filter: $filter)
  }
`

export function ResponsesItem({
  variant,
  fromJourneyList = false,
  journeyId
}: ResponseItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [loadVisitorsResponseCount, { data }] = useLazyQuery<
    GetJourneyVisitorsCountWithTextResponses,
    GetJourneyVisitorsCountWithTextResponsesVariables
  >(GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES)

  useEffect(() => {
    if (journeyId != null)
      void loadVisitorsResponseCount({
        variables: {
          filter: { journeyId: journeyId, hasTextResponse: true }
        }
      })
  }, [journeyId, loadVisitorsResponseCount, data])

  const linkHref = fromJourneyList
    ? `/journeys/${journeyId}/reports/visitors?withSubmittedText=true&from=journey-list`
    : `/journeys/${journeyId}/reports/visitors?withSubmittedText=true`

  const buttonProps = fromJourneyList
    ? {
        sx: {
          minWidth: 30,
          '& > .MuiButton-startIcon > .MuiSvgIcon-root': {
            fontSize: '20px'
          }
        }
      }
    : {}

  return (
    <Box data-testid="ResponsesItem">
      <NextLink href={linkHref} prefetch={false}>
        <Item
          variant={variant}
          label={t('Responses')}
          icon={<Inbox2Icon />}
          count={data?.journeyVisitorCount ?? 0}
          countLabel={t('{{count}} responses', {
            count: data?.journeyVisitorCount ?? 0
          })}
          ButtonProps={buttonProps}
        />
      </NextLink>
    </Box>
  )
}
