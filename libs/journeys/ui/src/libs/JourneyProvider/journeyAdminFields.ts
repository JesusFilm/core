import { gql } from '@apollo/client'

import { JOURNEY_FIELDS } from './journeyFields'

/**
 * Inherit common journey fields.
 * Add project-specific fields for reuse in journey query hooks.
 */
export const JOURNEY_ADMIN_FIELDS = gql`
  ${JOURNEY_FIELDS}
  fragment JourneyAdminFields on Journey {
    ...JourneyFields
    userJourneys {
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
    team {
      id
      userTeams {
        id
        role
        user {
          email
          firstName
          id
          imageUrl
          lastName
        }
      }
    }
    tags {
      id
      parentId
      name {
        value
        language {
          id
        }
        primary
      }
    }
  }
`
