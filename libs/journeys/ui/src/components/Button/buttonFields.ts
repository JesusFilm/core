import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const BUTTON_FIELDS = gql`
  ${ACTION_FIELDS}
  fragment ButtonFields on ButtonBlock {
    id
    parentBlockId
    parentOrder
    label
    buttonVariant: variant
    buttonColor: color
    size
    startIconId
    endIconId
    submitEnabled
    action {
      ...ActionFields
    }
    submitEnabled
    settings {
      alignment
    }
  }
`
