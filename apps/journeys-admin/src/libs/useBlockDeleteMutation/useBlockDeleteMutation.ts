import { ApolloLink, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockDelete,
  BlockDeleteVariables
} from '../../../__generated__/BlockDelete'
import { BlockFields } from '../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../blockDeleteUpdate'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!) {
    blockDelete(id: $id) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
  }
`

export function useBlockDeleteMutation(
  options?: useMutation.Options<BlockDelete, BlockDeleteVariables>
): [
  (
    block: BlockFields,
    options?: useMutation.MutationFunctionOptions<
      BlockDelete,
      BlockDeleteVariables
    >
  ) => Promise<ApolloLink.Result<BlockDelete> | undefined>,
  useMutation.Result<BlockDelete>
] {
  const { journey } = useJourney()
  const [blockDeleteMutation, result] = useMutation<
    BlockDelete,
    BlockDeleteVariables
  >(BLOCK_DELETE, options)

  async function wrappedBlockDeleteMutation(
    block: TreeBlock,
    options: useMutation.MutationFunctionOptions<
      BlockDelete,
      BlockDeleteVariables
    >
  ): Promise<ApolloLink.Result<BlockDelete> | undefined> {
    if (journey == null) return

    return await blockDeleteMutation({
      update(cache, { data }) {
        blockDeleteUpdate(cache, journey.id, block, data?.blockDelete)
      },
      ...options,
      // Apollo Client 4 types a mutate call's `variables` as complete, while
      // `MutationFunctionOptions` only carries a partial override, so merge the
      // caller's over the block id rather than letting it replace them.
      variables: { id: block.id, ...options?.variables }
    })
  }

  return [wrappedBlockDeleteMutation, result]
}
