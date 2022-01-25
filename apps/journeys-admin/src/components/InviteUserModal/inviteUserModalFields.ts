import { gql } from '@apollo/client'

export const INVITE_USER_MODAL_FIELDS = gql`
  fragment InviteUserModalFields on UserJourney {
    id
    role
    user {
      id
      firstName
      lastName
      email
      imageUrl
    }
  }
`
