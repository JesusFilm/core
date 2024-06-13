import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_REFERRER_FIELDS = gql`
  fragment PlausibleJourneyReferrerFields on PlausibleStatsResponse {
    property
    visitors
  }
`
