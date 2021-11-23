import { gql } from '@apollo/client'

export const GRID_CONTAINER_FIELDS = gql`
  fragment GridContainerFields on GridContainerBlock {
    id
    parentBlockId
    spacing
    direction
    justifyContent
    alignItems
  }
`
