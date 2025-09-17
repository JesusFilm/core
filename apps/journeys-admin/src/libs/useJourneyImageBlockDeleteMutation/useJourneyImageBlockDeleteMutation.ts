import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >
): MutationTuple<JourneyImageBlockDelete, JourneyImageBlockDeleteVariables> {
  const mutation = useMutation<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >(JOURNEY_IMAGE_BLOCK_DELETE, options)

  return mutation
}
