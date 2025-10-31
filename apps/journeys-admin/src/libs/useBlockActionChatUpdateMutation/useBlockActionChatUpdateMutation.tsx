import { FetchResult, gql } from '@apollo/client'
import {
  useMutation,
  type MutationFunctionOptions,
  type MutationResult
} from '@apollo/client/react'

import {
  BlockActionChatUpdate,
  BlockActionChatUpdateVariables
} from '../../../__generated__/BlockActionChatUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_CHAT_UPDATE = gql`
  mutation BlockActionChatUpdate($id: ID!, $input: ChatActionInput!) {
    blockUpdateChatAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      chatUrl
      customizable
      parentStepId
    }
  }
`

export function useBlockActionChatUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionChatUpdate,
    BlockActionChatUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    chatUrl: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: MutationFunctionOptions<
      BlockActionChatUpdate,
      BlockActionChatUpdateVariables
    >
  ) => Promise<FetchResult<BlockActionChatUpdate> | undefined>,
  MutationResult<BlockActionChatUpdate>
] {
  const [blockActionChatUpdate, result] = useMutation<
    BlockActionChatUpdate,
    BlockActionChatUpdateVariables
  >(BLOCK_ACTION_CHAT_UPDATE, options)

  async function wrappedBlockActionChatUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    chatUrl: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: MutationFunctionOptions<
      BlockActionChatUpdate,
      BlockActionChatUpdateVariables
    >
  ): Promise<FetchResult<BlockActionChatUpdate> | undefined> {
    return await blockActionChatUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { chatUrl, customizable, parentStepId }
      },
      optimisticResponse: {
        blockUpdateChatAction: {
          __typename: 'ChatAction',
          parentBlockId: block.id,
          gtmEventName: '',
          chatUrl,
          customizable,
          parentStepId
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateChatAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateChatAction
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionChatUpdate, result]
}
