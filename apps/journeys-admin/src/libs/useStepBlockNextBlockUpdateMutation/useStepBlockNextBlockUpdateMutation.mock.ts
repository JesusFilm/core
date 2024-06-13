import { MockedResponse } from '@apollo/client/testing'

import {
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
} from '../../../__generated__/StepBlockNextBlockUpdate'

import { STEP_BLOCK_NEXT_BLOCK_UPDATE } from './useStepBlockNextBlockUpdateMutation'

export const stepBlockNextBlockUpdateMock: MockedResponse<
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
> = {
  request: {
    query: STEP_BLOCK_NEXT_BLOCK_UPDATE,
    variables: {
      id: 'step0.id',
      journeyId: 'journey-id',
      input: {
        nextBlockId: null
      }
    }
  },
  result: {
    data: {
      stepBlockUpdate: {
        __typename: 'StepBlock',
        id: 'step0.id',
        nextBlockId: null
      }
    }
  }
}
