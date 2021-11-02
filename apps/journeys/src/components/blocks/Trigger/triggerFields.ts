import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../../../libs/action'

export const TRIGGER_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment TriggerFields on VideoTriggerBlock {
    id
    parentBlockId
    triggerStart
    triggerAction: action {
      ...ActionFields
    }
  }
`
