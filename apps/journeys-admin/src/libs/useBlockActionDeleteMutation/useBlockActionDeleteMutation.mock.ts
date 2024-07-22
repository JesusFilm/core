import { MockedResponse } from '@apollo/client/testing'

import {
  BlockActionDelete,
  BlockActionDeleteVariables
} from '../../../__generated__/BlockActionDelete'

import { BLOCK_ACTION_DELETE } from './useBlockActionDeleteMutation'

export const blockActionDeleteMock: MockedResponse<
  BlockActionDelete,
  BlockActionDeleteVariables
> = {
  request: {
    query: BLOCK_ACTION_DELETE,
    variables: {
      id: 'block1.id'
    }
  },
  result: {
    data: {
      blockDeleteAction: {
        __typename: 'ButtonBlock',
        id: 'block1.id'
      }
    }
  }
}
