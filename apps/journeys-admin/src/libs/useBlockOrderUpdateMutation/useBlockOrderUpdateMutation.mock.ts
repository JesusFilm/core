import { MockedResponse } from '@apollo/client/testing'

import {
  BlockOrderUpdate,
  BlockOrderUpdateVariables
} from '../../../__generated__/BlockOrderUpdate'

import { BLOCK_ORDER_UPDATE } from './useBlockOrderUpdateMutation'

export const blockOrderUpdateMock: MockedResponse<
  BlockOrderUpdate,
  BlockOrderUpdateVariables
> = {
  request: {
    query: BLOCK_ORDER_UPDATE,
    variables: {
      id: 'blockId',
      parentOrder: 0
    }
  },
  result: {
    data: {
      blockOrderUpdate: [
        {
          __typename: 'StepBlock',
          id: 'blockId',
          parentOrder: 0
        }
      ]
    }
  }
}
