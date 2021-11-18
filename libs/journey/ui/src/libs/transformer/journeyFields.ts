import { gql } from '@apollo/client'
import { BUTTON_FIELDS, IMAGE_FIELDS, STEP_FIELDS, TYPOGRAPHY_FIELDS, VIDEO_FIELDS, VIDEO_TRIGGER_FIELDS} from '../../components'

export const JOURNEY_FIELDS = gql`
  ${BUTTON_FIELDS}
  ${IMAGE_FIELDS}
  ${STEP_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  ${VIDEO_TRIGGER_FIELDS}
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
        ... on ImageBlock {
          ...ImageFields
        }
        ... on StepBlock {
          ...StepFields
        }
        ... on TypographyBlock {
          ...TypographyFields
        }
        ... on VideoBlock {
          ...VideoFields
        }
        ... on VideoTriggerBlock {
          ...VideoTriggerFields
        }        
      }
    }
  }
`

//       ${CARD_FIELDS}
//       ${GRID_CONTAINER_FIELDS}
//       ${GRID_ITEM_FIELDS}
//       ${RADIO_OPTION_FIELDS}
//       ${RADIO_QUESTION_FIELDS}
//       ${SIGN_UP_FIELDS}



            // ... on CardBlock {
            //   ...CardFields
            // }
            // ... on GridContainerBlock {
            //   ...GridContainerFields
            // }
            // ... on GridItemBlock {
            //   ...GridItemFields
            // }

            // ... on RadioOptionBlock {
            //   ...RadioOptionFields
            // }
            // ... on RadioQuestionBlock {
            //   ...RadioQuestionFields
            // }
            // ... on SignUpBlock {
            //   ...SignUpFields
            // }
           