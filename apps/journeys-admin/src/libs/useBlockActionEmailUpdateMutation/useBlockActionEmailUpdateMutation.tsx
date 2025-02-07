import {
  FetchResult,
  MutationFunctionOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../__generated__/BlockActionEmailUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'
import { journeyUpdatedAtCacheUpdate } from '../journeyUpdatedAtCacheUpdate'

export const BLOCK_ACTION_EMAIL_UPDATE = gql`
  mutation BlockActionEmailUpdate($id: ID!, $input: EmailActionInput!) {
    blockUpdateEmailAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      email
    }
  }
`

export function useBlockActionEmailUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionEmailUpdate,
    BlockActionEmailUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    options?: MutationFunctionOptions<
      BlockActionEmailUpdate,
      BlockActionEmailUpdateVariables
    >
  ) => Promise<FetchResult<BlockActionEmailUpdate> | undefined>,
  MutationResult<BlockActionEmailUpdate>
] {
  const { journey } = useJourney()
  const [blockActionEmailUpdate, result] = useMutation<
    BlockActionEmailUpdate,
    BlockActionEmailUpdateVariables
  >(BLOCK_ACTION_EMAIL_UPDATE, options)

  async function wrappedBlockActionEmailUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    email: string,
    options?: MutationFunctionOptions<
      BlockActionEmailUpdate,
      BlockActionEmailUpdateVariables
    >
  ): Promise<FetchResult<BlockActionEmailUpdate> | undefined> {
    return await blockActionEmailUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { email }
      },
      optimisticResponse: {
        blockUpdateEmailAction: {
          __typename: 'EmailAction',
          parentBlockId: block.id,
          gtmEventName: '',
          email
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateEmailAction != null && journey != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateEmailAction
            }
          })
          journeyUpdatedAtCacheUpdate(cache, journey.id)
        }
      }
    })
  }

  return [wrappedBlockActionEmailUpdate, result]
}
