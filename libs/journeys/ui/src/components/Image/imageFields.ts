import { gql } from '@apollo/client'

export const IMAGE_FIELDS = gql`
  fragment ImageFields on ImageBlock {
    id
    journeyId
    parentBlockId
    src
    alt
    width
    height
    blurhash
  }
`
