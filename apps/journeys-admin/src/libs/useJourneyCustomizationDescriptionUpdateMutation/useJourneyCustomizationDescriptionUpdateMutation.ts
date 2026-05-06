import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneyCustomizationDescriptionUpdate,
  JourneyCustomizationDescriptionUpdateVariables
} from '../../../__generated__/JourneyCustomizationDescriptionUpdate'

export const JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE = gql`
  mutation JourneyCustomizationDescriptionUpdate(
    $journeyId: ID!
    $string: String!
  ) {
    journeyCustomizationFieldPublisherUpdate(
      journeyId: $journeyId
      string: $string
    ) {
      id
      key
      value
    }
  }
`

/**
 * Updates the publisher-customization description on a journey. The mutation
 * itself returns the customization fields, so callers that display the
 * top-level `journey.journeyCustomizationDescription` (e.g. the editor's
 * LocalTemplateDetailsDialog) need to write back to the Journey entity in the
 * Apollo cache via the `update` option to keep the dialog's initial values
 * fresh on reopen.
 */
export function useJourneyCustomizationDescriptionUpdateMutation(
  options?: MutationHookOptions<
    JourneyCustomizationDescriptionUpdate,
    JourneyCustomizationDescriptionUpdateVariables
  >
): MutationTuple<
  JourneyCustomizationDescriptionUpdate,
  JourneyCustomizationDescriptionUpdateVariables
> {
  return useMutation<
    JourneyCustomizationDescriptionUpdate,
    JourneyCustomizationDescriptionUpdateVariables
  >(JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE, options)
}
