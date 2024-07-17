import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionNavigateToBlockUpdate,
  BlockActionNavigateToBlockUpdateVariables
} from '../../../__generated__/BlockActionNavigateToBlockUpdate'

import { BLOCK_ACTION_NAVIGATE_TO_BLOCK_UPDATE } from './useBlockActionNavigateToBlockUpdateMutation'

export const blockActionNavigateToBlockUpdateMock: MockedResponse<
  BlockActionNavigateToBlockUpdate,
  BlockActionNavigateToBlockUpdateVariables
> = {
  request: {
    query: BLOCK_ACTION_NAVIGATE_TO_BLOCK_UPDATE,
    variables: {
      id: 'block1.id',
      input: {
        blockId: 'step2.id'
      }
    }
  },
  result: {
    data: {
      blockUpdateNavigateToBlockAction: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'step1.id',
        gtmEventName: null,
        blockId: 'block1.id'
      }
    }
  }
}
