import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_STEPS_FIELDS = gql`
  fragment PlausibleJourneyStepsFields on PlausibleStatsResponse {
    property
    visitors
    timeOnPage
  }
`
