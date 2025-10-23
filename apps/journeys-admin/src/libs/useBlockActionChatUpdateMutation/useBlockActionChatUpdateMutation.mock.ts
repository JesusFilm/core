import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionChatUpdate,
  BlockActionChatUpdateVariables
} from '../../../__generated__/BlockActionChatUpdate'

import { BLOCK_ACTION_CHAT_UPDATE } from './useBlockActionChatUpdateMutation'

export const blockActionChatUpdateMock: MockedResponse<
  BlockActionChatUpdate,
  BlockActionChatUpdateVariables
> = {
  request: {
    query: BLOCK_ACTION_CHAT_UPDATE,
    variables: {
      id: 'button2.id',
      input: {
        chatUrl: 'https://chat.example.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  },
  result: {
    data: {
      blockUpdateChatAction: {
        __typename: 'ChatAction',
        parentBlockId: 'button2.id',
        gtmEventName: null,
        chatUrl: 'https://chat.example.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  }
}
