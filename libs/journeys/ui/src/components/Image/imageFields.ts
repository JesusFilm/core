import { gql } from '@apollo/client'

export const IMAGE_FIELDS = gql`
  fragment ImageFields on ImageBlock {
    id
    parentBlockId
    parentOrder
    src
    alt
    width
    height
    blurhash
    scale
    focalTop
    focalLeft
  }
`
