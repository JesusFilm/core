import { gql } from '@apollo/client'

export const SPACER_FIELDS = gql`
  fragment SpacerFields on SpacerBlock {
    id
    parentBlockId
    parentOrder
    spacing
  }
`
