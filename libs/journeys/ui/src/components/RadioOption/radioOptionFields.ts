import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const RADIO_OPTION_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment RadioOptionFields on RadioOptionBlock {
    id
    parentBlockId
    parentOrder
    label
    action {
      ...ActionFields
    }
    pollOptionImageBlockId
  }
`
