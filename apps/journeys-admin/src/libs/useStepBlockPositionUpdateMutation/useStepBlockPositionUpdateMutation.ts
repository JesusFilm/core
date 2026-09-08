import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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
  options?: useMutation.Options<
    StepBlockPositionUpdate,
    StepBlockPositionUpdateVariables
  >
): useMutation.ResultTuple<
  StepBlockPositionUpdate,
  StepBlockPositionUpdateVariables
> {
  const mutation = useMutation<
    StepBlockPositionUpdate,
    StepBlockPositionUpdateVariables
  >(STEP_BLOCK_POSITION_UPDATE, options)

  return mutation
}
