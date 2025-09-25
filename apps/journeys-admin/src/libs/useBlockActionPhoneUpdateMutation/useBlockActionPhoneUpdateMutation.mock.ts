import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionPhoneUpdate,
  BlockActionPhoneUpdateVariables
} from '../../../__generated__/BlockActionPhoneUpdate'
import { ContactActionType } from '../../../__generated__/globalTypes'

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
        phone: '+19876543210',
        countryCode: 'US',
        contactAction: ContactActionType.call
      }
    }
  },
  result: {
    data: {
      blockUpdatePhoneAction: {
        __typename: 'PhoneAction',
        parentBlockId: 'button2.id',
        gtmEventName: null,
        phone: '+19876543210',
        countryCode: 'US',
        contactAction: ContactActionType.call
      }
    }
  }
}
