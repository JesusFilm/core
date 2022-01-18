import { gql } from '@apollo/client'

export const GRID_ITEM_FIELDS = gql`
  fragment GridItemFields on GridItemBlock {
    id
    journeyId
    parentBlockId
    xl
    lg
    sm
  }
`
