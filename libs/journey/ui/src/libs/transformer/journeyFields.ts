import { gql } from '@apollo/client'
import { BUTTON_FIELDS, CARD_FIELDS, STEP_FIELDS } from '../../components'

export const JOURNEY_FIELDS = gql`
  ${BUTTON_FIELDS}
  ${CARD_FIELDS}
  ${STEP_FIELDS}
  query GetJourney($id: ID!) {
    # slug might have to be string
    journey(id: $id, idType: slug) {
      id
      themeName
      themeMode
      title
      description
      primaryImageBlock {
        src
      }
      blocks {
        id
        parentBlockId
        ... on ButtonBlock {
          ...ButtonFields
        }
        ... on CardBlock {
          ...CardFields
        }
        ... on StepBlock {
          ...StepFields
        }
      }
    }
  }
`
