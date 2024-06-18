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
  BlockActionDelete,
  BlockActionDeleteVariables
} from '../../../__generated__/BlockActionDelete'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_DELETE = gql`
  mutation BlockActionDelete($id: ID!, $journeyId: ID!) {
    blockDeleteAction(id: $id, journeyId: $journeyId) {
      id
    }
  }
`

export function useBlockActionDeleteMutation(
  options?: MutationHookOptions<BlockActionDelete, BlockActionDeleteVariables>
): [
  (
    block: BlockFields,
    options?: MutationFunctionOptions<
      BlockActionDelete,
      BlockActionDeleteVariables
    >
  ) => Promise<FetchResult<BlockActionDelete> | undefined>,
  MutationResult<BlockActionDelete>
] {
  const { journey } = useJourney()
  const [blockActionDeleteMutation, result] = useMutation<
    BlockActionDelete,
    BlockActionDeleteVariables
  >(BLOCK_ACTION_DELETE, options)

  async function wrappedBlockActionDeleteMutation(
    block: TreeBlock,
    options: MutationFunctionOptions<
      BlockActionDelete,
      BlockActionDeleteVariables
    >
  ): Promise<FetchResult<BlockActionDelete> | undefined> {
    if (journey == null) return

    return await blockActionDeleteMutation({
      ...options,
      variables: {
        id: block.id,
        journeyId: journey.id
      },
      optimisticResponse: {
        blockDeleteAction: {
          __typename: block.__typename,
          id: block.id
        }
      },
      update(cache, { data }) {
        if (data?.blockDeleteAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => null
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionDeleteMutation, result]
}
