import { gql } from '@apollo/client'
import { BLOCK_FIELDS, IMAGE_FIELDS } from '../block'

export const JOURNEY_FIELDS = gql`
  ${BLOCK_FIELDS}
  ${IMAGE_FIELDS}
  fragment JourneyFields on Journey {
    id
    slug
    title
    description
    status
    language {
      id
      name {
        value
        primary
      }
    }
    createdAt
    publishedAt
    themeName
    themeMode
    seoTitle
    seoDescription
    blocks {
      ...BlockFields
    }
    primaryImageBlock {
      ...ImageFields
    }
    userJourneys {
      id
      user {
        id
        firstName
        lastName
        imageUrl
      }
    }
  }
`
