import { gql } from '@apollo/client'

export const MULTISELECT_QUESTION_FIELDS = gql`
  fragment MultiselectQuestionFields on MultiselectBlock {
    id
    parentBlockId
    parentOrder
    label
    submitLabel
    min
    max
    action {
      __typename
      parentBlockId
      gtmEventName
      ... on LinkAction {
        url
        target
        customizable
        parentStepId
      }
      ... on NavigateToBlockAction {
        blockId
      }
      ... on EmailAction {
        email
      }
      ... on PhoneAction {
        phone
        countryCode
      }
    }
  }
`
