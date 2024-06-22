import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_ACTIONS_SUMS_FIELDS = gql`
  fragment PlausibleJourneyActionsSumsFields on  PlausibleStatsResponse{
    property
    events
  }
`
