import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../Action'

export const BUTTON_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment ButtonBlockFields on ButtonBlock {
    id
    parentBlockId
    label
    variant
    color
    size
    startIcon {
      name
      color
      fontSize
    }
    endIcon {
      name
      color
      fontSize
    }
    action {
      ...ActionFields
    }
  }
`
