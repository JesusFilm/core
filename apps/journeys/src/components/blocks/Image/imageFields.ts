import { gql } from '@apollo/client'

export const IMAGE_FIELDS = gql`
  fragment ImageFields on ImageBlock {
    id
    parentBlockId
    src
    alt
    width
    height
  }
`
