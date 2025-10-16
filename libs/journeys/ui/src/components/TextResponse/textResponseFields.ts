import { FragmentOf, graphql } from '@core/shared/gql'

export const TEXT_RESPONSE_FIELDS = graphql(`
  fragment TextResponseFields on TextResponseBlock {
    id
    parentBlockId
    parentOrder
    required
    label
    placeholder
    hint
    minRows
    type
    routeId
    integrationId
    hideLabel
  }
`)

export type TextResponseFields = FragmentOf<typeof TEXT_RESPONSE_FIELDS>
