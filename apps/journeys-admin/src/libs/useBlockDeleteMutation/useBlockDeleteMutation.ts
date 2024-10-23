import {
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

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
    blockDeleteReferences(id: $id) {
      id
      ... on StepBlock {
        nextBlockId
      }
      ... on ButtonBlock {
        action {
          ... on NavigateToBlockAction {
            blockId
          }
        }
      }
      ... on RadioOptionBlock {
        action {
          ... on NavigateToBlockAction {
            blockId
          }
        }
      }
    }
    # blockUpdateAction(id: $id)
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
    if (journey == null) return

    return await blockDeleteMutation({
      variables: {
        id: block.id
      },
      update(cache, { data }) {
        // TODO(jk): also evict blockDeleteReferences
        blockDeleteUpdate(block, data, cache, journey.id)
      },
      ...options
    })
  }

  return [wrappedBlockDeleteMutation, result]
}
