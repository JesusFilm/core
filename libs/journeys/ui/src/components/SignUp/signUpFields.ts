import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const SIGN_UP_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment SignUpFields on SignUpBlock {
    id
    parentBlockId
    parentOrder
    submitLabel
    submitIconId
    action {
      ...ActionFields
    }
  }
`
