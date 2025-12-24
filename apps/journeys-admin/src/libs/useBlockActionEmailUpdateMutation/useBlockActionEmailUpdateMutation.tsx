import { ApolloLink, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../__generated__/BlockActionEmailUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'

export const BLOCK_ACTION_EMAIL_UPDATE = gql`
  mutation BlockActionEmailUpdate($id: ID!, $input: EmailActionInput!) {
    blockUpdateEmailAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      email
      customizable
      parentStepId
    }
  }
`

export function useBlockActionEmailUpdateMutation(
  options?: useMutation.MutationFunctionOptions<
    BlockActionEmailUpdate,
    BlockActionEmailUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    url: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: useMutation.MutationFunctionOptions<
      BlockActionEmailUpdate,
      BlockActionEmailUpdateVariables
    >
  ) => Promise<ApolloLink.Result<BlockActionEmailUpdate> | undefined>,
  useMutation.Result<BlockActionEmailUpdate>
] {
  const [blockActionEmailUpdate, result] = useMutation<
    BlockActionEmailUpdate,
    BlockActionEmailUpdateVariables
  >(BLOCK_ACTION_EMAIL_UPDATE, options)

  async function wrappedBlockActionEmailUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    email: string,
    customizable: boolean | null,
    parentStepId: string | null,
    options?: useMutation.MutationFunctionOptions<
      BlockActionEmailUpdate,
      BlockActionEmailUpdateVariables
    >
  ): Promise<ApolloLink.Result<BlockActionEmailUpdate> | undefined> {
    return await blockActionEmailUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { email, customizable, parentStepId }
      },
      optimisticResponse: {
        blockUpdateEmailAction: {
          __typename: 'EmailAction',
          parentBlockId: block.id,
          gtmEventName: '',
          email,
          customizable,
          parentStepId
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateEmailAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateEmailAction
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionEmailUpdate, result]
}
