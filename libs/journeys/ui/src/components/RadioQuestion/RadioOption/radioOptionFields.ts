import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../../../libs/action'

export const RADIO_OPTION_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment RadioOptionFields on RadioOptionBlock {
    id
    parentBlockId
    label
    action {
      ...ActionFields
    }
  }
`
