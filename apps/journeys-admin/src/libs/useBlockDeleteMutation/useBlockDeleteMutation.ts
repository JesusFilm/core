import {
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockDelete,
  BlockDeleteVariables
} from '../../../__generated__/BlockDelete'
import { BlockFields } from '../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../blockDeleteUpdate'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
  }
`

export function useBlockDeleteMutation(
  options?: MutationHookOptions<BlockDelete, BlockDeleteVariables>
): [
  (
    block: BlockFields,
    options?: MutationFunctionOptions<BlockDelete, BlockDeleteVariables>
  ) => Promise<FetchResult<BlockDelete> | undefined>,
  MutationResult<BlockDelete>
] {
  const { journey } = useJourney()
  const [blockDeleteMutation, result] = useMutation<
    BlockDelete,
    BlockDeleteVariables
  >(BLOCK_DELETE, options)

  async function wrappedBlockDeleteMutation(
    block: TreeBlock,
    options: MutationFunctionOptions<BlockDelete, BlockDeleteVariables>
  ): Promise<FetchResult<BlockDelete> | undefined> {
    try {
      if (journey == null) return

      return await blockDeleteMutation({
        variables: {
          id: block.id,
          journeyId: journey.id,
          parentBlockId: block.parentBlockId
        },
        update(cache, { data }) {
          blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
        },
        ...options
      })
    } catch {
      return undefined
    }
  }

  return [wrappedBlockDeleteMutation, result]
}
