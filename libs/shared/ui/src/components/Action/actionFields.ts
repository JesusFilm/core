import { gql } from '@apollo/client'

export const ACTION_FIELDS = gql`
  fragment ActionFields on Action {
    __typename
    gtmEventName
    ... on NavigateAction {
      gtmEventName
    }
    ... on NavigateToJourneyAction {
      journeyId
    }
    ... on LinkAction {
      url
    }
  }
`
