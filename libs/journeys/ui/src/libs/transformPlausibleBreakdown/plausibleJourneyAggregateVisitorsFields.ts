import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_AGGREGATE_VISITORS_FIELDS = gql`
  fragment PlausibleJourneyAggregateVisitorsFields on PlausibleStatsAggregateResponse {
    visitors {
      value
    }
  }
`
