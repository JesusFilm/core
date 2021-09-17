import { gql } from '@apollo/client'

export const TYPOGRAPHY_TYPE = gql`
  fragment TypographyBlockProps on TypographyBlock {
    id
    parentBlockId
    align
    color
    content
    variant
  }
`
