import { MockedResponse } from '@apollo/client/testing'

import {
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
} from '../../../__generated__/NavigateToBlockActionUpdate'

import { NAVIGATE_TO_BLOCK_ACTION_UPDATE } from './useNavigateToBlockActionUpdateMutation'

export const navigateToBlockActionUpdateMock: MockedResponse<
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
> = {
  request: {
    query: NAVIGATE_TO_BLOCK_ACTION_UPDATE,
    variables: {
      id: 'block1.id',
      journeyId: 'journey-id',
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
