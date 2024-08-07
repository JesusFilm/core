import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
} from '../../../__generated__/StepBlockNextBlockUpdate'

export const STEP_BLOCK_NEXT_BLOCK_UPDATE = gql`
  mutation StepBlockNextBlockUpdate($id: ID!, $nextBlockId: ID) {
    stepBlockUpdate(id: $id, input: { nextBlockId: $nextBlockId }) {
      id
      nextBlockId
    }
  }
`

export function useStepBlockNextBlockUpdateMutation(
  options?: MutationHookOptions<
    StepBlockNextBlockUpdate,
    StepBlockNextBlockUpdateVariables
  >
): MutationTuple<StepBlockNextBlockUpdate, StepBlockNextBlockUpdateVariables> {
  return useMutation<
    StepBlockNextBlockUpdate,
    StepBlockNextBlockUpdateVariables
  >(STEP_BLOCK_NEXT_BLOCK_UPDATE, options)
}
