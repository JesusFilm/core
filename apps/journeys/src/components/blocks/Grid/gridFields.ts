import { gql } from '@apollo/client'

export const GRID_FIELDS = gql`
  fragment GridFields on GridBlock {
    id
    parentBlockId
    container {
      spacing
      direction
      justifyContent
      alignItems
    }
    item {
      xl
      lg
      sm
    }
  }
`
