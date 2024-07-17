import {
  MutationFunctionOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'

import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../__generated__/BlockActionLinkUpdate'

export const BLOCK_ACTION_LINK_UPDATE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation BlockActionLinkUpdate(
    $id: ID!
    $input: LinkActionInput!
  ) {
    blockUpdateLinkAction(id: $id, input: $input) {
      parentBlockId
      parentBlock {
        id
        ...BlockUpdateActionFields
      }
    }
  }
`

export function useBlockActionLinkUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionLinkUpdate,
    BlockActionLinkUpdateVariables
  >
): MutationTuple<BlockActionLinkUpdate, BlockActionLinkUpdateVariables> {
  return useMutation<BlockActionLinkUpdate, BlockActionLinkUpdateVariables>(
    BLOCK_ACTION_LINK_UPDATE,
    options
  )
}
