import { gql } from '@apollo/client'

export const GRID_CONTAINER_FIELDS = gql`
  fragment GridContainerFields on GridContainerBlock {
    id
    parentBlockId
    parentOrder
    spacing
    direction
    justifyContent
    alignItems
  }
`
