import {
  FetchResult,
  MutationFunctionOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../__generated__/BlockActionLinkUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'
import { journeyUpdatedAtCacheUpdate } from '../journeyUpdatedAtCacheUpdate'

export const BLOCK_ACTION_LINK_UPDATE = gql`
  mutation BlockActionLinkUpdate($id: ID!, $input: LinkActionInput!) {
    blockUpdateLinkAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      url
    }
  }
`

export function useBlockActionLinkUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionLinkUpdate,
    BlockActionLinkUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    options?: MutationFunctionOptions<
      BlockActionLinkUpdate,
      BlockActionLinkUpdateVariables
    >
  ) => Promise<FetchResult<BlockActionLinkUpdate> | undefined>,
  MutationResult<BlockActionLinkUpdate>
] {
  const { journey } = useJourney()
  const [blockActionLinkUpdate, result] = useMutation<
    BlockActionLinkUpdate,
    BlockActionLinkUpdateVariables
  >(BLOCK_ACTION_LINK_UPDATE, options)

  async function wrappedBlockActionLinkUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    options?: MutationFunctionOptions<
      BlockActionLinkUpdate,
      BlockActionLinkUpdateVariables
    >
  ): Promise<FetchResult<BlockActionLinkUpdate> | undefined> {
    return await blockActionLinkUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { url }
      },
      optimisticResponse: {
        blockUpdateLinkAction: {
          __typename: 'LinkAction',
          parentBlockId: block.id,
          gtmEventName: '',
          url
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateLinkAction != null && journey != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateLinkAction
            }
          })
          journeyUpdatedAtCacheUpdate(cache, journey.id)
        }
      }
    })
  }

  return [wrappedBlockActionLinkUpdate, result]
}
