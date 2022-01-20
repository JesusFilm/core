import { gql } from '@apollo/client'

export const TYPOGRAPHY_FIELDS = gql`
  fragment TypographyFields on TypographyBlock {
    id
    parentBlockId
    align
    color
    content
    variant
  }
`
