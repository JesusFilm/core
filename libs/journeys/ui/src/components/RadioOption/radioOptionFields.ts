import { FragmentOf, graphql } from '@core/shared/gql'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const RADIO_OPTION_FIELDS = graphql(`
  ${ACTION_FIELDS}
  fragment RadioOptionFields on RadioOptionBlock {
    id
    parentBlockId
    parentOrder
    label
    action {
      ...ActionFields
    }
    pollOptionImageBlockId
  }
`)

export type RadioOptionFields = FragmentOf<typeof RADIO_OPTION_FIELDS>
