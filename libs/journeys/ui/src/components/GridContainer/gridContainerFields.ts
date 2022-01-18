import { gql } from '@apollo/client'

export const GRID_CONTAINER_FIELDS = gql`
  fragment GridContainerFields on GridContainerBlock {
    id
    journeyId
    parentBlockId
    spacing
    direction
    justifyContent
    alignItems
  }
`
