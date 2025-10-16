import { FragmentOf, graphql } from '@core/shared/gql'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const BUTTON_FIELDS = graphql(
  `
    fragment ButtonFields on ButtonBlock {
      id
      parentBlockId
      parentOrder
      label
      buttonVariant: variant
      buttonColor: color
      size
      startIconId
      endIconId
      submitEnabled
      action {
        ...ActionFields
      }
      submitEnabled
      settings {
        alignment
      }
    }
  `,
  [ACTION_FIELDS]
)

export type ButtonFields = FragmentOf<typeof BUTTON_FIELDS>
