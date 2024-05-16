import { MockedResponse } from '@apollo/client/testing'

import { BlockDelete } from '../../../__generated__/BlockDelete'

import { BLOCK_DELETE } from './useBlockDeleteMutation'

export const deleteBlockMock: MockedResponse<BlockDelete> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: 'typography0.id',
      parentBlockId: 'card1.id',
      journeyId: 'journeyId'
    }
  },
  result: {
    data: {
      blockDelete: [
        {
          __typename: 'TypographyBlock',
          id: 'block1.id',
          parentOrder: 0
        }
      ]
    }
  }
}
