import { gql } from '@apollo/client'
import { ACTION_FIELDS } from '../../libs/action'

export const BUTTON_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment ButtonFields on ButtonBlock {
    id
    parentBlockId
    label
    buttonVariant: variant
    buttonColor: color
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
