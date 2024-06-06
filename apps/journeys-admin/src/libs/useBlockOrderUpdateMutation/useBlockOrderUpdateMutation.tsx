import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  BlockOrderUpdate,
  BlockOrderUpdateVariables
} from '../../../__generated__/BlockOrderUpdate'

export const BLOCK_ORDER_UPDATE = gql`
  mutation BlockOrderUpdate($id: ID!, $journeyId: ID!, $parentOrder: Int!) {
    blockOrderUpdate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
  }
`
export function useBlockOrderUpdateMutation(
  options?: MutationHookOptions<BlockOrderUpdate, BlockOrderUpdateVariables>
): MutationTuple<BlockOrderUpdate, BlockOrderUpdateVariables> {
  const mutation = useMutation<BlockOrderUpdate, BlockOrderUpdateVariables>(
    BLOCK_ORDER_UPDATE,
    options
  )

  return mutation
}
