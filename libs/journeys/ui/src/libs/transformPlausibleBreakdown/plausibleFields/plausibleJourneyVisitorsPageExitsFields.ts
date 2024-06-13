import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_VISITORS_PAGE_EXITS_FIELDS = gql`
  fragment PlausibleJourneyVisitorsPageExitsFields on PlausibleStatsResponse {
    property
    visitors
  }
`
