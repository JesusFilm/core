import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";

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
  options?: useMutation.Options<
    JourneyImageBlockUpdate,
    JourneyImageBlockUpdateVariables
  >
): useMutation.ResultTuple<JourneyImageBlockUpdate, JourneyImageBlockUpdateVariables> {
  const mutation = useMutation<
    JourneyImageBlockUpdate,
    JourneyImageBlockUpdateVariables
  >(JOURNEY_IMAGE_BLOCK_UPDATE, options)

  return mutation
}
