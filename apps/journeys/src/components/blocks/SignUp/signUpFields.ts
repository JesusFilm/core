import { gql } from '@apollo/client'

export const SIGNUP_FIELDS = gql`
  fragment SignUpFields on SignupBlock {
    id
    parentBlockId
    action {
      __typename
      gtmEventName
    }
  }
`
