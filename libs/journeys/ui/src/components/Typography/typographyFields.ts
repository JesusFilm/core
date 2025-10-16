import { FragmentOf, graphql } from '@core/shared/gql'

export const TYPOGRAPHY_FIELDS = graphql(`
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
`)

export type TypographyFields = FragmentOf<typeof TYPOGRAPHY_FIELDS>
