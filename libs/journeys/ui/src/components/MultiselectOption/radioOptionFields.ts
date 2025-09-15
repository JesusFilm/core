import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const MULTISELECT_OPTION_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment MultiselectOptionFields on MultiselectOptionBlock {
    id
    parentBlockId
    parentOrder
    label
    action {
      ...ActionFields
    }
  }
`
