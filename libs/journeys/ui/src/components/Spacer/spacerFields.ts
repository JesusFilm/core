import { FragmentOf, graphql } from '@core/shared/gql'

export const SPACER_FIELDS = graphql(`
  fragment SpacerFields on SpacerBlock {
    id
    parentBlockId
    parentOrder
    spacing
  }
`)

export type SpacerFields = FragmentOf<typeof SPACER_FIELDS>
