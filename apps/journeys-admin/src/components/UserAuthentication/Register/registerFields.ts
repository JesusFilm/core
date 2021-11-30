import { gql } from '@apollo/client'

export const REGISTER_FIELDS = gql`
  fragment RegisterFields on User {
    id
    firstName
    lastName
    email
    imageUrl
  }
`
