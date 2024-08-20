import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../__generated__/JourneySettingsUpdate'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

export const JOURNEY_SETTINGS_UPDATE = gql`
  ${JOURNEY_FIELDS}
  mutation JourneySettingsUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
     ...JourneyFields
    }
  }
`
export function useJourneyUpdateMutation(
  options?: MutationHookOptions<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >
): MutationTuple<JourneySettingsUpdate, JourneySettingsUpdateVariables> {
  const mutation = useMutation<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >(JOURNEY_SETTINGS_UPDATE, options)

  return mutation
}
