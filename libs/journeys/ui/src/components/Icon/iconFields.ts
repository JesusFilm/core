import { gql } from '@apollo/client'

export const ICON_FIELDS = gql`
  fragment IconFields on IconBlock {
    id
    parentBlockId
    parentOrder
    name
    size
    color
  }
`
