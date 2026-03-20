import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
      journeyCustomizationDescription
    }
  }
`

export function useJourneyCustomizationDescriptionTranslateMutation(
  options?: MutationHookOptions<
    JourneyCustomizationDescriptionTranslate,
    JourneyCustomizationDescriptionTranslateVariables
  >
): MutationTuple<
  JourneyCustomizationDescriptionTranslate,
  JourneyCustomizationDescriptionTranslateVariables
> {
  return useMutation<
    JourneyCustomizationDescriptionTranslate,
    JourneyCustomizationDescriptionTranslateVariables
  >(JOURNEY_CUSTOMIZATION_DESCRIPTION_TRANSLATE, options)
}
