import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const VIDEO_TRIGGER_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment VideoTriggerFields on VideoTriggerBlock {
    id
    parentBlockId
    triggerStart
    triggerAction: action {
      ...ActionFields
    }
  }
`
