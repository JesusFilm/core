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
  }
`

export const BLOCK_UPDATE_ACTION_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment BlockUpdateActionFields on Block {
    ...on ButtonBlock {
      action {
        ...ActionFields
      }
    }
    ...on FormBlock {
      action {
        ...ActionFields
      }
    }
    ...on RadioOptionBlock {
      action {
        ...ActionFields
      }
    }
    ...on SignUpBlock {
      action {
        ...ActionFields
      }
    }
    ...on VideoBlock {
      action {
        ...ActionFields
      }
    }
  }
  `
