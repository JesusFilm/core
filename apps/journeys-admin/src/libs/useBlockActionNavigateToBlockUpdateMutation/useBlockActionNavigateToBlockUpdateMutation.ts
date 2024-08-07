import {
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import {
  BlockActionNavigateToBlockUpdate,
  BlockActionNavigateToBlockUpdateVariables
} from '../../../__generated__/BlockActionNavigateToBlockUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_NAVIGATE_TO_BLOCK_UPDATE = gql`
  mutation BlockActionNavigateToBlockUpdate($id: ID!, $blockId: String!) {
    blockUpdateNavigateToBlockAction(id: $id, input: { blockId: $blockId }) {
      parentBlockId
      gtmEventName
      blockId
    }
  }
`

export function useBlockActionNavigateToBlockUpdateMutation(
  options?: MutationHookOptions<
    BlockActionNavigateToBlockUpdate,
    BlockActionNavigateToBlockUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    targetBlockId: string,
    options?: MutationFunctionOptions<
      BlockActionNavigateToBlockUpdate,
      BlockActionNavigateToBlockUpdateVariables
    >
  ) => Promise<FetchResult<BlockActionNavigateToBlockUpdate> | undefined>,
  MutationResult<BlockActionNavigateToBlockUpdate>
] {
  const [blockActionNavigateToBlockUpdate, result] = useMutation<
    BlockActionNavigateToBlockUpdate,
    BlockActionNavigateToBlockUpdateVariables
  >(BLOCK_ACTION_NAVIGATE_TO_BLOCK_UPDATE, options)

  async function wrappedBlockActionNavigateToBlockUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    targetBlockId: string,
    options?: MutationFunctionOptions<
      BlockActionNavigateToBlockUpdate,
      BlockActionNavigateToBlockUpdateVariables
    >
  ): Promise<FetchResult<BlockActionNavigateToBlockUpdate> | undefined> {
    return await blockActionNavigateToBlockUpdate({
      ...options,
      variables: {
        id: block.id,
        blockId: targetBlockId
      },
      optimisticResponse: {
        blockUpdateNavigateToBlockAction: {
          __typename: 'NavigateToBlockAction',
          parentBlockId: block.id,
          gtmEventName: '',
          blockId: targetBlockId
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateNavigateToBlockAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateNavigateToBlockAction
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionNavigateToBlockUpdate, result]
}
