import { FragmentOf, graphql } from '@core/shared/gql'

export const IMAGE_FIELDS = graphql(`
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
`)

export type ImageFields = FragmentOf<typeof IMAGE_FIELDS>
