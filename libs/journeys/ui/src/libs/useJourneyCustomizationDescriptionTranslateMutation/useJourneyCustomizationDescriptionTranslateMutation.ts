import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  JourneyCustomizationDescriptionTranslate,
  JourneyCustomizationDescriptionTranslateVariables
} from './__generated__/JourneyCustomizationDescriptionTranslate'

export const JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE = gql`
  mutation JourneyCustomizationDescriptionTranslate(
    $input: JourneyCustomizationDescriptionTranslateInput!
  ) {
    journeyCustomizationDescriptionTranslate(input: $input) {
      id
    }
  }
`

export function useJourneyCustomizationDescriptionTranslateMutation(
  options?: useMutation.Options<
    JourneyCustomizationDescriptionTranslate,
    JourneyCustomizationDescriptionTranslateVariables
  >
): useMutation.ResultTuple<
  JourneyCustomizationDescriptionTranslate,
  JourneyCustomizationDescriptionTranslateVariables
> {
  return useMutation<
    JourneyCustomizationDescriptionTranslate,
    JourneyCustomizationDescriptionTranslateVariables
  >(JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE, options)
}
