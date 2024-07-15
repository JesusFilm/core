import {
  MutationFunctionOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'

import {
  LinkActionUpdate,
  LinkActionUpdateVariables
} from '../../../__generated__/LinkActionUpdate'

export const LINK_ACTION_UPDATE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation LinkActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: LinkActionInput!
  ) {
    blockUpdateLinkAction(id: $id, journeyId: $journeyId, input: $input) {
      parentBlockId
      parentBlock {
        id
        ...BlockUpdateActionFields
      }
    }
  }
`

export function useLinkActionUpdateMutation(
  options?: MutationFunctionOptions<LinkActionUpdate, LinkActionUpdateVariables>
): MutationTuple<LinkActionUpdate, LinkActionUpdateVariables> {
  return useMutation<LinkActionUpdate, LinkActionUpdateVariables>(
    LINK_ACTION_UPDATE,
    options
  )
}
