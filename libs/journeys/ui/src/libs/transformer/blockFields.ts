import { gql } from '@apollo/client'
import { BUTTON_FIELDS } from '../../components/Button/buttonFields'
import { CARD_FIELDS } from '../../components/Card/cardFields'
import { GRID_CONTAINER_FIELDS } from '../../components/GridContainer/gridContainerFields'
import { GRID_ITEM_FIELDS } from '../../components/GridContainer/GridItem/gridItemFields'
import { IMAGE_FIELDS } from '../../components/Image/imageFields'
import { RADIO_OPTION_FIELDS } from '../../components/RadioQuestion/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '../../components/RadioQuestion/radioQuestionFields'
import { SIGN_UP_FIELDS } from '../../components/SignUp/signUpFields'
import { STEP_FIELDS } from '../../components/Step/stepFields'
import { TYPOGRAPHY_FIELDS } from '../../components/Typography/typographyFields'
import { VIDEO_FIELDS } from '../../components/Video/videoFields'
import { VIDEO_TRIGGER_FIELDS } from '../../components/Video/VideoTrigger/videoTriggerFields'

export const BLOCK_FIELDS = gql`
  ${BUTTON_FIELDS}
  ${CARD_FIELDS}
  ${GRID_CONTAINER_FIELDS}
  ${GRID_ITEM_FIELDS}
  ${IMAGE_FIELDS}
  ${RADIO_OPTION_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${SIGN_UP_FIELDS}
  ${STEP_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  ${VIDEO_TRIGGER_FIELDS}
  fragment BlockFields on Block {
    id
    parentBlockId
    journeyId
    ... on ButtonBlock {
      ...ButtonFields
    }
    ... on CardBlock {
      ...CardFields
    }
    ... on GridContainerBlock {
      ...GridContainerFields
    }
    ... on GridItemBlock {
      ...GridItemFields
    }
    ... on ImageBlock {
      ...ImageFields
    }
    ... on RadioOptionBlock {
      ...RadioOptionFields
    }
    ... on RadioQuestionBlock {
      ...RadioQuestionFields
    }
    ... on SignUpBlock {
      ...SignUpFields
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
`

export {
  BUTTON_FIELDS,
  CARD_FIELDS,
  GRID_CONTAINER_FIELDS,
  GRID_ITEM_FIELDS,
  IMAGE_FIELDS,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS,
  SIGN_UP_FIELDS,
  STEP_FIELDS,
  TYPOGRAPHY_FIELDS,
  VIDEO_FIELDS,
  VIDEO_TRIGGER_FIELDS
}
