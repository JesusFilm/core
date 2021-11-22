import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../../libs/action'

export const SIGN_UP_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment SignUpFields on SignUpBlock {
    id
    parentBlockId
    submitLabel
    action {
      ...ActionFields
    }
    submitIcon {
      name
      color
      size
    }
  }
`
