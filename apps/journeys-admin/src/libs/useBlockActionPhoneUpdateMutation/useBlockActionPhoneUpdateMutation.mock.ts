import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionPhoneUpdate,
  BlockActionPhoneUpdateVariables
} from '../../../__generated__/BlockActionPhoneUpdate'

import { BLOCK_ACTION_PHONE_UPDATE } from './useBlockActionPhoneUpdateMutation'

export const blockActionPhoneUpdateMock: MockedResponse<
  BlockActionPhoneUpdate,
  BlockActionPhoneUpdateVariables
> = {
  request: {
    query: BLOCK_ACTION_PHONE_UPDATE,
    variables: {
      id: 'button2.id',
      input: {
        phone: '+9876543210'
      }
    }
  },
  result: {
    data: {
      blockUpdatePhoneAction: {
        __typename: 'PhoneAction',
        parentBlockId: 'button2.id',
        gtmEventName: null,
        phone: '+9876543210'
      }
    }
  }
}
