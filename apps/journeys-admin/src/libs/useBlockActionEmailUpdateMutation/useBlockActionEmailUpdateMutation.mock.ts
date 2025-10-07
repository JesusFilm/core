import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../__generated__/BlockActionEmailUpdate'

import { BLOCK_ACTION_EMAIL_UPDATE } from './useBlockActionEmailUpdateMutation'

export const blockActionEmailUpdateMock: MockedResponse<
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
> = {
  request: {
    query: BLOCK_ACTION_EMAIL_UPDATE,
    variables: {
      id: 'button2.id',
      input: {
        email: 'edmondwashere@gmail.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  },
  result: {
    data: {
      blockUpdateEmailAction: {
        __typename: 'EmailAction',
        parentBlockId: 'button2.id',
        gtmEventName: null,
        email: 'edmondwashere@gmail.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  }
}
