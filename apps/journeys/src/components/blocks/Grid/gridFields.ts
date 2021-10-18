import { gql } from '@apollo/client'

export const GRID_FIELDS = gql`
  fragment GridFields on GridBlock {
    id
    parentBlockId
    md
    type
  }
`
