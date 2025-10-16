import { FragmentOf, graphql } from '@core/shared/gql'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const SIGN_UP_FIELDS = graphql(`
  ${ACTION_FIELDS}
  fragment SignUpFields on SignUpBlock {
    id
    parentBlockId
    parentOrder
    submitLabel
    submitIconId
    action {
      ...ActionFields
    }
  }
`)

export type SignUpFields = FragmentOf<typeof SIGN_UP_FIELDS>
