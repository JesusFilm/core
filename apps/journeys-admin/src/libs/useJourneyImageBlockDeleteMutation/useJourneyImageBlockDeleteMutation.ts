import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";

import {
  JourneyImageBlockDelete,
  JourneyImageBlockDeleteVariables
} from '../../../__generated__/JourneyImageBlockDelete'

export const JOURNEY_IMAGE_BLOCK_DELETE = gql`
  mutation JourneyImageBlockDelete($id: ID!, $journeyId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export function useJourneyImageBlockDeleteMutation(
  options?: useMutation.Options<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >
): useMutation.ResultTuple<JourneyImageBlockDelete, JourneyImageBlockDeleteVariables> {
  const mutation = useMutation<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >(JOURNEY_IMAGE_BLOCK_DELETE, options)

  return mutation
}
