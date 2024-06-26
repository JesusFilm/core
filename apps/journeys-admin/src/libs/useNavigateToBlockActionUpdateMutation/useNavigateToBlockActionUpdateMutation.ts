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

import { BlockFields } from '../../../__generated__/BlockFields'
import {
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
} from '../../../__generated__/NavigateToBlockActionUpdate'

export const NAVIGATE_TO_BLOCK_ACTION_UPDATE = gql`
  mutation NavigateToBlockActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      parentBlockId
      gtmEventName
      blockId
    }
  }
`

export function useNavigateToBlockActionUpdateMutation(
  options?: MutationHookOptions<
    NavigateToBlockActionUpdate,
    NavigateToBlockActionUpdateVariables
  >
): [
  (
    block: BlockFields,
    targetBlockId: string,
    options?: MutationFunctionOptions<
      NavigateToBlockActionUpdate,
      NavigateToBlockActionUpdateVariables
    >
  ) => Promise<FetchResult<NavigateToBlockActionUpdate> | undefined>,
  MutationResult<NavigateToBlockActionUpdate>
] {
  const { journey } = useJourney()
  const [navigateToBlockActionUpdate, result] = useMutation<
    NavigateToBlockActionUpdate,
    NavigateToBlockActionUpdateVariables
  >(NAVIGATE_TO_BLOCK_ACTION_UPDATE, options)

  async function wrappedNavigateToBlockActionUpdate(
    block: TreeBlock,
    targetBlockId: string,
    options?: MutationFunctionOptions<
      NavigateToBlockActionUpdate,
      NavigateToBlockActionUpdateVariables
    >
  ): Promise<FetchResult<NavigateToBlockActionUpdate> | undefined> {
    if (journey == null) return

    return await navigateToBlockActionUpdate({
      ...options,
      variables: {
        id: block.id,
        journeyId: journey.id,
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

  return [wrappedNavigateToBlockActionUpdate, result]
}
