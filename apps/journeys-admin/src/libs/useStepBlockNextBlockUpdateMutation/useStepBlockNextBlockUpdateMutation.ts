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
  mutation StepBlockNextBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
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
  const mutation = useMutation<
    StepBlockNextBlockUpdate,
    StepBlockNextBlockUpdateVariables
  >(STEP_BLOCK_NEXT_BLOCK_UPDATE, options)

  return mutation
}
