import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../../../libs/action'

export const BUTTON_FIELDS = gql`
  fragment ButtonFields on ButtonBlock {
    ${ACTION_FIELDS}
    id
    parentBlockId
    label
    variant
    color
    size
    startIcon {
      name
      color
      size
    }
    endIcon {
      name
      color
      size
    }
    action {
      ...ActionFields
    }
  }
`
