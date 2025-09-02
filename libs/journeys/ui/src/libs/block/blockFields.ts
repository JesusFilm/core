import { gql } from '@apollo/client'

import { BUTTON_FIELDS } from '../../components/Button/buttonFields'
import { CARD_FIELDS } from '../../components/Card/cardFields'
import { ICON_FIELDS } from '../../components/Icon/iconFields'
import { IMAGE_FIELDS } from '../../components/Image/imageFields'
import { RADIO_OPTION_FIELDS } from '../../components/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '../../components/RadioQuestion/radioQuestionFields'
import { SIGN_UP_FIELDS } from '../../components/SignUp/signUpFields'
import { SPACER_FIELDS } from '../../components/Spacer/spacerFields'
import { STEP_FIELDS } from '../../components/Step/stepFields'
import { TEXT_RESPONSE_FIELDS } from '../../components/TextResponse/textResponseFields'
import { TYPOGRAPHY_FIELDS } from '../../components/Typography/typographyFields'
import { VIDEO_FIELDS } from '../../components/Video/videoFields'
import { VIDEO_TRIGGER_FIELDS } from '../../components/VideoTrigger/videoTriggerFields'

export const BLOCK_FIELDS = gql`
  ${BUTTON_FIELDS}
  ${CARD_FIELDS}
  ${ICON_FIELDS}
  ${IMAGE_FIELDS}
  ${RADIO_OPTION_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${SIGN_UP_FIELDS}
  ${STEP_FIELDS}
  ${SPACER_FIELDS}
  ${TEXT_RESPONSE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  ${VIDEO_TRIGGER_FIELDS}
  fragment BlockFields on Block {
    id
    parentBlockId
    parentOrder
    ... on ButtonBlock {
      ...ButtonFields
    }
    ... on CardBlock {
      ...CardFields
    }
    ... on IconBlock {
      ...IconFields
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
    ... on SpacerBlock {
      ...SpacerFields
    }
    ... on StepBlock {
      ...StepFields
    }
    ... on TextResponseBlock {
      ...TextResponseFields
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
