import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  StepBlockPositionUpdate,
  StepBlockPositionUpdateVariables
} from '../../../__generated__/StepBlockPositionUpdate'

export const STEP_BLOCK_POSITION_UPDATE = gql`
  mutation StepBlockPositionUpdate($input: [StepBlockPositionUpdateInput!]!) {
    stepBlockPositionUpdate(input: $input) {
      id
      x
      y
    }
  }
`

export function useStepBlockPositionUpdateMutation(
  options?: MutationHookOptions<
    StepBlockPositionUpdate,
    StepBlockPositionUpdateVariables
  >
): MutationTuple<StepBlockPositionUpdate, StepBlockPositionUpdateVariables> {
  const mutation = useMutation<
    StepBlockPositionUpdate,
    StepBlockPositionUpdateVariables
  >(STEP_BLOCK_POSITION_UPDATE, options)

  return mutation
}
