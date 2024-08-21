import {
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockActionDelete,
  BlockActionDeleteVariables
} from '../../../__generated__/BlockActionDelete'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_DELETE = gql`
  mutation BlockActionDelete($id: ID!) {
    blockDeleteAction(id: $id) {
      id
    }
  }
`

export function useBlockActionDeleteMutation(
  options?: MutationHookOptions<BlockActionDelete, BlockActionDeleteVariables>
): [
  (
    block: Pick<BlockFields, '__typename' | 'id'>,
    options?: MutationFunctionOptions<
      BlockActionDelete,
      BlockActionDeleteVariables
    >
  ) => Promise<FetchResult<BlockActionDelete> | undefined>,
  MutationResult<BlockActionDelete>
] {
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
    return await blockActionDeleteMutation({
      ...options,
      variables: {
        id: block.id
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
