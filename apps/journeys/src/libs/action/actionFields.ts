import { gql } from '@apollo/client'

export const ACTION_FIELDS = gql`
  fragment ActionFields on Action {
    gtmEventName
    ... on NavigateToBlockAction {
      blockId
    }
    ... on NavigateToJourneyAction {
      journeyId
    }
    ... on LinkAction {
      url
    }
  }
`
