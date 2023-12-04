import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const FORM_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment FormFields on FormBlock {
    id
    parentBlockId
    parentOrder
    form
    action {
      ...ActionFields
    }
  }
`
