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
import { useBlockActionNavigateToBlockUpdateMutation } from '../useBlockActionNavigateToBlockUpdateMutation'

export function useWrappedNavigateToBlockActionUpdateMutation(
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
  const [navigateToBlockActionUpdate, result] =
    useBlockActionNavigateToBlockUpdateMutation(options)

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
      }
    })
  }

  return [wrappedNavigateToBlockActionUpdate, result]
}
