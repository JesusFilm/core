import { gql } from '@apollo/client'

export const BUTTON_FIELDS = gql`
  fragment ButtonFields on ButtonBlock {
    id
    parentBlockId
    label
    variant
    color
    size
    startIcon {
      name
      color
      size
    }
    endIcon {
      name
      color
      size
    }
    action {
      __typename
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
  }
`
