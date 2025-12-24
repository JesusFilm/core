import { gql } from '@apollo/client'

export const MULTISELECT_OPTION_FIELDS = gql`
  fragment MultiselectOptionFields on MultiselectOptionBlock {
    id
    parentBlockId
    parentOrder
    label
  }
`
