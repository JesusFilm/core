import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

import {
  JourneyImageBlockUpdate,
  JourneyImageBlockUpdateVariables
} from '../../../__generated__/JourneyImageBlockUpdate'

export const JOURNEY_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...ImageFields
    }
  }
`

export function useJourneyImageBlockUpdateMutation(
  options?: MutationHookOptions<
    JourneyImageBlockUpdate,
    JourneyImageBlockUpdateVariables
  >
): MutationTuple<JourneyImageBlockUpdate, JourneyImageBlockUpdateVariables> {
  const mutation = useMutation<
    JourneyImageBlockUpdate,
    JourneyImageBlockUpdateVariables
  >(JOURNEY_IMAGE_BLOCK_UPDATE, options)

  return mutation
}
