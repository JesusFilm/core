import { gql } from '@apollo/client'

export const PLAUSIBLE_JOURNEY_STEPS_ACTIONS_FIELDS = gql`
  fragment PlausibleJourneyStepsActionsFields on PlausibleStatsResponse {
    property
    events
  }
`
