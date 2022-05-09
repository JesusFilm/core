import { gql } from '@apollo/client'
import { BLOCK_FIELDS, IMAGE_FIELDS } from '../transformer'

export const GET_JOURNEY = gql`
  ${BLOCK_FIELDS}
  ${IMAGE_FIELDS}
  query GetJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
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
  }
`
