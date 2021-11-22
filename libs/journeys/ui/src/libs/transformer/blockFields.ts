import { gql } from '@apollo/client'
import {
  BUTTON_FIELDS,
  CARD_FIELDS,
  GRID_CONTAINER_FIELDS,
  GRID_ITEM_FIELDS,
  IMAGE_FIELDS,
  RADIO_QUESTION_FIELDS,
  RADIO_OPTION_FIELDS,
  SIGN_UP_FIELDS,
  STEP_FIELDS,
  TYPOGRAPHY_FIELDS,
  VIDEO_FIELDS,
  VIDEO_TRIGGER_FIELDS
} from '../../components'

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
