import { useQuery } from '@apollo/client/react'
// eslint-disable-next-line import/no-named-as-default
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { type ReactElement } from 'react'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import type {
  GetAdminJourneyWithPlausibleToken,
  GetAdminJourneyWithPlausibleTokenVariables
} from '../../../__generated__/GetAdminJourneyWithPlausibleToken'
import {
  PlausibleEmbedFrame,
  plausibleEmbedStatus
} from '../PlausibleEmbedFrame'

export const GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourneyWithPlausibleToken($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
      plausibleToken
    }
  }
`

interface PlausibleEmbedDashboardProps {
  host?: string // for testing
}

export function PlausibleEmbedDashboard({
  host
}: PlausibleEmbedDashboardProps): ReactElement {
  const router = useRouter()

  const { data, loading, error } = useQuery<
    GetAdminJourneyWithPlausibleToken,
    GetAdminJourneyWithPlausibleTokenVariables
  >(GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN, {
    variables: { id: router.query.journeyId as string }
  })

  const journeyId = router.query.journeyId as string

  return (
    <PlausibleEmbedFrame
      siteId={`api-journeys-journey-${journeyId}`}
      status={plausibleEmbedStatus({
        loading,
        error,
        token: data?.journey.plausibleToken
      })}
      host={host}
    />
  )
}
