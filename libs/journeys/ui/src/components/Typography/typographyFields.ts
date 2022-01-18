import { gql } from '@apollo/client'

export const TYPOGRAPHY_FIELDS = gql`
  fragment TypographyFields on TypographyBlock {
    id
    journeyId
    parentBlockId
    align
    color
    content
    variant
  }
`
