import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

import {
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
} from '../../../__generated__/JourneyImageBlockCreate'

export const JOURNEY_IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
  }
`

export function useJourneyImageBlockCreateMutation(
  options?: useMutation.Options<
    JourneyImageBlockCreate,
    JourneyImageBlockCreateVariables
  >
): useMutation.ResultTuple<
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
> {
  const mutation = useMutation<
    JourneyImageBlockCreate,
    JourneyImageBlockCreateVariables
  >(JOURNEY_IMAGE_BLOCK_CREATE, options)

  return mutation
}
