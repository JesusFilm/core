import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../__generated__/BlockActionLinkUpdate'

import { BLOCK_ACTION_LINK_UPDATE } from './useBlockActionLinkUpdateMutation'

export const blockActionLinkUpdateMock: MockedResponse<
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
> = {
  request: {
    query: BLOCK_ACTION_LINK_UPDATE,
    variables: {
      id: 'button2.id',
      input: {
        url: 'https://github.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  },
  result: {
    data: {
      blockUpdateLinkAction: {
        __typename: 'LinkAction',
        parentBlockId: 'button2.id',
        gtmEventName: null,
        url: 'https://github.com',
        customizable: false,
        parentStepId: 'step.id'
      }
    }
  }
}
