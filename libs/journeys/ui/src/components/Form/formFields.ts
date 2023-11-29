import { gql } from '@apollo/client'

export const FORM_FIELDS = gql`
  fragment FormFields on FormBlock {
    id
    parentBlockId
    parentOrder
  }
`
