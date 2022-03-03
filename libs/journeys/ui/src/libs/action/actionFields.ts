import { gql } from '@apollo/client'

export const ACTION_FIELDS = gql`
  fragment ActionFields on Action {
    parentBlockId
    gtmEventName
    ... on NavigateToBlockAction {
      blockId
    }
    ... on NavigateToJourneyAction {
      journey {
        id
        slug
      }
    }
    ... on LinkAction {
      url
    }
  }
`
