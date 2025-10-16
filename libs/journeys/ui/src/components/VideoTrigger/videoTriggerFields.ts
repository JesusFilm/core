import { FragmentOf, graphql } from '@core/shared/gql'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const VIDEO_TRIGGER_FIELDS = graphql(`
  ${ACTION_FIELDS}
  fragment VideoTriggerFields on VideoTriggerBlock {
    id
    parentBlockId
    triggerStart
    triggerAction: action {
      ...ActionFields
    }
  }
`)

export type VideoTriggerFields = FragmentOf<typeof VIDEO_TRIGGER_FIELDS>
