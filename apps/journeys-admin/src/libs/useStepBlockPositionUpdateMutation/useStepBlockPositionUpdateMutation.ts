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
  mutation StepBlockPositionUpdate(
    $id: ID!
    $journeyId: ID!
    $x: Int!
    $y: Int!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: { x: $x, y: $y }) {
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
