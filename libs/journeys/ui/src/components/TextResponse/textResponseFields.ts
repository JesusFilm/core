import { gql } from '@apollo/client'

export const TEXT_RESPONSE_FIELDS = gql`
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
`
