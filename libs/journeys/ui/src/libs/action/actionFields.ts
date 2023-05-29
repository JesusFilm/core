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
        language {
          bcp47
        }
      }
    }
    ... on LinkAction {
      url
    }
    ... on EmailAction {
      email
    }
  }
`
