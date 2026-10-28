import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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
  options?: useMutation.Options<
    StepBlockNextBlockUpdate,
    StepBlockNextBlockUpdateVariables
  >
): useMutation.ResultTuple<
  StepBlockNextBlockUpdate,
  StepBlockNextBlockUpdateVariables
> {
  return useMutation<
    StepBlockNextBlockUpdate,
    StepBlockNextBlockUpdateVariables
  >(STEP_BLOCK_NEXT_BLOCK_UPDATE, options)
}
