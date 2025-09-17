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
      customizable
      parentStepId
    }
    ... on EmailAction {
      email
      customizable
      parentStepId
    }
    ... on PhoneAction {
      phone
      countryCode
    }
  }
`
