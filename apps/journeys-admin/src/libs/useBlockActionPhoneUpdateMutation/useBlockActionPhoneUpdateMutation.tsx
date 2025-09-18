import {
  FetchResult,
  MutationFunctionOptions,
  MutationResult,
  gql,
  useMutation
} from '@apollo/client'

import {
  BlockActionPhoneUpdate,
  BlockActionPhoneUpdateVariables
} from '../../../__generated__/BlockActionPhoneUpdate'
import { BlockFields } from '../../../__generated__/BlockFields'
import { ContactActionType } from '../../../__generated__/globalTypes'

export const BLOCK_ACTION_PHONE_UPDATE = gql`
  mutation BlockActionPhoneUpdate($id: ID!, $input: PhoneActionInput!) {
    blockUpdatePhoneAction(id: $id, input: $input) {
      parentBlockId
      gtmEventName
      phone
      countryCode
      contactAction
    }
  }
`

export function useBlockActionPhoneUpdateMutation(
  options?: MutationFunctionOptions<
    BlockActionPhoneUpdate,
    BlockActionPhoneUpdateVariables
  >
): [
  (
    block: Pick<BlockFields, 'id' | '__typename'>,
    phone: string,
    countryCode: string,
    contactAction: ContactActionType,
    options?: MutationFunctionOptions<
      BlockActionPhoneUpdate,
      BlockActionPhoneUpdateVariables
    >
  ) => Promise<FetchResult<BlockActionPhoneUpdate> | undefined>,
  MutationResult<BlockActionPhoneUpdate>
] {
  const [blockActionPhoneUpdate, result] = useMutation<
    BlockActionPhoneUpdate,
    BlockActionPhoneUpdateVariables
  >(BLOCK_ACTION_PHONE_UPDATE, options)

  async function wrappedBlockActionPhoneUpdate(
    block: Pick<BlockFields, 'id' | '__typename'>,
    phone: string,
    countryCode: string,
    contactAction: ContactActionType,
    options?: MutationFunctionOptions<
      BlockActionPhoneUpdate,
      BlockActionPhoneUpdateVariables
    >
  ): Promise<FetchResult<BlockActionPhoneUpdate> | undefined> {
    return await blockActionPhoneUpdate({
      ...options,
      variables: {
        id: block.id,
        input: { phone, countryCode, contactAction }
      },
      optimisticResponse: {
        blockUpdatePhoneAction: {
          __typename: 'PhoneAction',
          parentBlockId: block.id,
          gtmEventName: '',
          phone,
          countryCode,
          contactAction
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdatePhoneAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdatePhoneAction
            }
          })
        }
      }
    })
  }

  return [wrappedBlockActionPhoneUpdate, result]
}
