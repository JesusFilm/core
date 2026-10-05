import { gql } from '@apollo/client'

export const MULTISELECT_FIELDS = gql`
  fragment MultiselectFields on MultiselectBlock {
    id
    parentBlockId
    parentOrder
    min
    max
  }
`
