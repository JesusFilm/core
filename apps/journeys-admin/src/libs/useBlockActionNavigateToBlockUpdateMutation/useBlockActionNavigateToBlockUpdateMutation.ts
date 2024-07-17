import {
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockActionNavigateToBlockUpdate,
  BlockActionNavigateToBlockUpdateVariables
} from '../../../__generated__/BlockActionNavigateToBlockUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_NAVIGATE_TO_BLOCK_UPDATE = gql`
  mutation BlockActionNavigateToBlockUpdate(
    $id: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      input: $input
    ) {
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
  const { journey } = useJourney()
  const [BlockActionNavigateToBlockUpdate, result] = useMutation<
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
    if (journey == null) return

    return await BlockActionNavigateToBlockUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { blockId: targetBlockId }
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
