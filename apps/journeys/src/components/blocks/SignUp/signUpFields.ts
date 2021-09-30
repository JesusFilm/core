import { gql } from '@apollo/client'

export const SIGN_UP_FIELDS = gql`
  fragment SignUpFields on SignupBlock {
    id
    parentBlockId
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
