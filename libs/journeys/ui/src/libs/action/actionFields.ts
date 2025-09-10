import { gql } from '@apollo/client'

export const ACTION_FIELDS = gql`
  fragment ActionFields on Action {
    parentBlockId
    gtmEventName
    ... on NavigateToBlockAction {
      blockId
    }
    ... on LinkAction {
      url
    }
    ... on EmailAction {
      email
    }
    ... on PhoneAction {
      phone
      countryCode
    }
  }
`
