import { gql } from '@apollo/client'

export const TYPOGRAPHY_FIELDS = gql`
  fragment TypographyFields on TypographyBlock {
    id
    parentBlockId
    parentOrder
    align
    color
    content
    variant
    settings {
      color
    }
  }
`
