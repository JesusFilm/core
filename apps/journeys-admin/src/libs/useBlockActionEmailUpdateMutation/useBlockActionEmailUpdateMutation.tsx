import {
  MutationFunctionOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'

import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../__generated__/BlockActionEmailUpdate'

export const BLOCK_ACTION_EMAIL_UPDATE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation BlockActionEmailUpdate(
    $id: ID!
    $input: EmailActionInput!
  ) {
    blockUpdateEmailAction(id: $id, input: $input) {
      parentBlockId
      parentBlock {
        id
        ...BlockUpdateActionFields
      }
    }
  }
`

export function useBlockActionEmailUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionEmailUpdate,
    BlockActionEmailUpdateVariables
  >
): MutationTuple<BlockActionEmailUpdate, BlockActionEmailUpdateVariables> {
  return useMutation<BlockActionEmailUpdate, BlockActionEmailUpdateVariables>(
    BLOCK_ACTION_EMAIL_UPDATE,
    options
  )
}
