import { ApolloLink, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../__generated__/BlockActionLinkUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_LINK_UPDATE = gql`
  mutation BlockActionLinkUpdate($id: ID!, $input: LinkActionInput!) {
    blockUpdateLinkAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      url
      customizable
      parentStepId
    }
  }
`

export function useBlockActionLinkUpdateMutation(
  options?: useMutation.MutationFunctionOptions<
    BlockActionLinkUpdate,
    BlockActionLinkUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: useMutation.MutationFunctionOptions<
      BlockActionLinkUpdate,
      BlockActionLinkUpdateVariables
    >
  ) => Promise<ApolloLink.Result<BlockActionLinkUpdate> | undefined>,
  useMutation.Result<BlockActionLinkUpdate>
] {
  const [blockActionLinkUpdate, result] = useMutation<
    BlockActionLinkUpdate,
    BlockActionLinkUpdateVariables
  >(BLOCK_ACTION_LINK_UPDATE, options)

  async function wrappedBlockActionLinkUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: useMutation.MutationFunctionOptions<
      BlockActionLinkUpdate,
      BlockActionLinkUpdateVariables
    >
  ): Promise<ApolloLink.Result<BlockActionLinkUpdate> | undefined> {
    return await blockActionLinkUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { url, customizable, parentStepId }
      },
      optimisticResponse: {
        blockUpdateLinkAction: {
          __typename: 'LinkAction',
          parentBlockId: block.id,
          gtmEventName: '',
          url,
          customizable,
          parentStepId
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateLinkAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateLinkAction
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionLinkUpdate, result]
}
