import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const TEXT_RESPONSE_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment TextResponseFields on TextResponseBlock {
    id
    parentBlockId
    parentOrder
    label
    hint
    minRows
    submitLabel
    submitIconId
    action {
      ...ActionFields
    }
  }
`
