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
      variables: {
        id: block.id as string
      },
      update(cache, { data }) {
        blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
      },
      ...options
    })
  }

  return [wrappedBlockDeleteMutation, result]
}
